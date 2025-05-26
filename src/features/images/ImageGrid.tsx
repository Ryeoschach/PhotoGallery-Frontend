import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { List } from 'antd';
import {
  selectFilteredImages,
  selectSelectedImageIds,
  selectImagesStatus,
  toggleImageSelection,
  fetchImages,
  setFilter
} from './imagesSlice';
import type { RootState } from '../../app/store';
import { selectCurrentUser } from '../auth/authSlice';
import type { AppDispatch } from '../../app/store';
import ImageCard from '../../components/ImageCard';
import EmptyState from '../../components/EmptyState';
import '../../components/ImageCard.css'; // 确保 ImageCard 的新 CSS 被引入
import './ImageGridLayout.css'; // 导入新的布局样式
import { useNavigate, useLocation } from 'react-router-dom'; // 导入 useNavigate 和 useLocation

interface ImageGridProps {
  selectionMode?: boolean;  // 是否启用选择模式
  filter?: string;          // 过滤条件，如 'mine'、'all' 等
  columns?: number;         // 新增：网格列数
  imageSpacing?: number;    // 新增：图片间距
  gridPadding?: number;     // 新增：网格内边距
  featuredImages?: number[]; // 特色图片ID列表
  featuredGroups?: number[]; // 特色分组ID列表
  showRecent?: boolean;      // 是否显示最近上传的图片
  recentCount?: number;      // 最近上传图片的数量
}

const ImageGrid: React.FC<ImageGridProps> = ({
  selectionMode = false,
  filter = 'all',
  columns = 4, // 默认列数
  imageSpacing = 16, // 默认图片间距
  gridPadding = 16, // 默认网格内边距
  featuredImages = [], // 特色图片ID列表
  featuredGroups = [], // 特色分组ID列表
  showRecent = true, // 是否显示最近上传的图片
  recentCount = 6, // 最近上传图片的数量
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); // 初始化 useNavigate
  const location = useLocation(); // 初始化 useLocation
  const images = useSelector(selectFilteredImages);
  const selectedImageIds = useSelector(selectSelectedImageIds);
  const currentUser = useSelector(selectCurrentUser); // 使用selectCurrentUser选择器获取当前用户
  
  // 使用选择器获取图片加载状态
  const imagesStatus = useSelector(selectImagesStatus);
  
  // 单独获取selectedGroupId，使其成为组件状态的一部分
  const selectedGroupId = useSelector((state: RootState) => state.images.selectedGroupId);
  const storeFilter = useSelector((state: RootState) => state.images.filter);
  
  const effectiveFilter = filter || storeFilter;
  
  const prevFilterRef = useRef<string>(filter);
  const prevPathRef = useRef<string>(window.location.pathname);
  const initialLoadDoneRef = useRef<boolean>(false);

  // Determine current path for conditional rendering
  // const currentPath = window.location.pathname; // 改用 useLocation
  const currentPath = location.pathname;
  
  // 在组件挂载和filter/pathname变化时加载图片数据
  useEffect(() => {
    console.log(
      'ImageGrid useEffect - filter:', filter, 
      'status:', imagesStatus, 
      'pathname:', currentPath,
      'prevFilter:', prevFilterRef.current,
      'prevPath:', prevPathRef.current,
      'initialLoadDone:', initialLoadDoneRef.current
    );
    
    // 判断是否需要发送新请求
    const filterChanged = prevFilterRef.current !== filter;
    const pathChanged = prevPathRef.current !== currentPath;
    
    // 如果状态正在加载中且filter和path都未变，则跳过请求
    if (imagesStatus === 'loading' && !filterChanged && !pathChanged) {
      console.log('跳过请求 - 已经在加载中且过滤条件未变');
      return;
    }

    // 首先更新ref，记住当前的filter和path
    prevFilterRef.current = filter;
    prevPathRef.current = currentPath;
    
    // 处理"我的照片"页面 - 该页面自己会调用fetchImages
    if (currentPath === '/my-photos') {
      console.log('在"我的照片"页面，保持过滤器为mine');
      // MyPhotosPage已经设置了过滤器为mine，这里什么也不做
      return;
    }
    
    // 在首页上，不在这里加载照片，改由HomePage组件负责
    if (currentPath === '/' || currentPath === '/home') {
      console.log('在首页上 - 由HomePage组件处理加载');
      // 确保使用'all'过滤器
      if (storeFilter !== 'all') {
        console.log('在首页中重置过滤器为all');
        dispatch(setFilter('all'));
      }
      return;
    }
    
    // 处理其他页面
    if (filter === 'mine') {
      dispatch(fetchImages({ mine: true }));
    } else if (filterChanged || pathChanged) {
      // 只有当过滤条件或路径变化时才重新获取所有照片
      dispatch(fetchImages());
    }
    
    initialLoadDoneRef.current = true;
  }, [dispatch, filter, storeFilter, window.location.pathname, imagesStatus]);
  
  // 记录过滤器变化，以便调试
  useEffect(() => {
    console.log('ImageGrid过滤器状态:', {
      propFilter: filter,
      storeFilter: storeFilter,
      effectiveFilter: effectiveFilter,
      location: window.location.pathname
    });
  }, [filter, storeFilter, effectiveFilter]);
  
  // 根据过滤器过滤图片，并实现特色内容逻辑
  const filteredImages = useMemo(() => {
    console.log(
      'ImageGrid: 应用过滤器', 
      'effectiveFilter:', effectiveFilter, 
      'currentUser:', currentUser?.id, 
      'selectedGroupId:', selectedGroupId,
      'featuredImages:', featuredImages,
      'featuredGroups:', featuredGroups
    );
    
    let result = images;
    
    // 首先基于用户过滤
    if (effectiveFilter === 'mine' && currentUser) {
      result = result.filter(img => img.owner === currentUser.id);
    }
    
    // 然后基于分组过滤
    if (selectedGroupId) {
      result = result.filter(img => 
        img.groups && Array.isArray(img.groups) && img.groups.includes(selectedGroupId)
      );
    }
    
    // 如果在首页，实现特色内容显示逻辑
    if (currentPath === '/' || currentPath === '/home') {
      // 1. 获取特色图片
      const featuredImagesSet = new Set(featuredImages);
      const featuredImagesData = result.filter(img => featuredImagesSet.has(img.id));
      
      // 2. 获取特色分组中的图片
      let featuredGroupImages: typeof result = [];
      if (featuredGroups.length > 0) {
        featuredGroupImages = result.filter(img => 
          img.groups && Array.isArray(img.groups) && 
          img.groups.some(groupId => featuredGroups.includes(groupId))
        );
      }
      
      // 3. 获取最近上传的图片（如果启用）
      let recentImages: typeof result = [];
      if (showRecent && recentCount > 0) {
        // 按上传时间降序排序，取最新的几张
        recentImages = [...result]
          .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
          .slice(0, recentCount);
      }
      
      // 4. 合并并去重，保持优先级：特色图片 > 特色分组图片 > 最近图片 > 其他图片
      const allFeaturedIds = new Set([
        ...featuredImagesData.map(img => img.id),
        ...featuredGroupImages.map(img => img.id),
        ...recentImages.map(img => img.id)
      ]);
      
      const otherImages = result.filter(img => !allFeaturedIds.has(img.id));
      
      // 按优先级组合结果
      result = [
        ...featuredImagesData, // 特色图片优先
        ...featuredGroupImages.filter(img => !featuredImagesSet.has(img.id)), // 特色分组图片（排除已在特色图片中的）
        ...recentImages.filter(img => 
          !featuredImagesSet.has(img.id) && 
          !featuredGroupImages.some(fg => fg.id === img.id)
        ), // 最近图片（排除已显示的）
        ...otherImages // 其他图片
      ];
      
      console.log('特色内容处理结果:', {
        总图片数: images.length,
        过滤后图片数: result.length,
        特色图片数: featuredImagesData.length,
        特色分组图片数: featuredGroupImages.length,
        最近图片数: recentImages.length,
        其他图片数: otherImages.length
      });
    }
    
    return result;
  }, [images, effectiveFilter, currentUser, selectedGroupId, currentPath, featuredImages, featuredGroups, showRecent, recentCount]); // 使用effectiveFilter替代filter

  // 处理图片选择/取消选择
  const handleImageSelect = (id: number) => {
    dispatch(toggleImageSelection(id));
  };

  // 添加 handleEdit 函数
  const handleEdit = (id: number) => {
    navigate(`/images/${id}`);
  };
  
  // 如果没有图片，显示空状态
  if (filteredImages.length === 0) {
    return <EmptyState message="暂无图片" description="没有找到符合条件的图片" />;
  }

  // 根据传入的 props 动态计算 List.grid 的值
  const listGridConfig = {
    gutter: imageSpacing, // 使用 imageSpacing 作为 gutter
    column: columns, // 直接设置列数，使其在所有屏幕尺寸下一致
    // 根据列数调整一些配置
    xs: 1,  // 在超小屏幕上始终为1列
    sm: columns > 3 ? 2 : columns, // 小屏幕最多2列
    md: columns > 4 ? 3 : columns, // 中屏幕最多3列
    lg: columns > 5 ? 4 : columns, // 大屏幕最多4列
    xl: columns, // 超大屏幕使用设定的列数
  };

  // 添加日志跟踪布局参数
  console.log('ImageGrid 当前布局参数:', { columns, imageSpacing, gridPadding, listGridConfig });

  // 计算列宽度的CSS变量值
  const columnWidthVar = `calc(${100 / columns}% - ${imageSpacing}px)`;

  return (
    <div 
      className={`image-grid-container grid-columns-${columns} ${columns > 4 ? 'grid-adaptive' : ''}`} 
      style={{ 
        padding: `${gridPadding}px`,
        '--column-width': columnWidthVar, // 使用CSS变量传递列宽度
        '--image-spacing': `${imageSpacing}px` // 传递间距
      } as React.CSSProperties} 
    > 
      <List
        grid={listGridConfig} // 使用动态配置
        dataSource={filteredImages}
        renderItem={(image) => {
          if (!image) return null;
          
          const isSelected = selectedImageIds.includes(image.id);
          
          // 判断图片类型以添加视觉标识
          const isFeaturedImage = featuredImages.includes(image.id);
          const isFeaturedGroupImage = featuredGroups.length > 0 && 
            image.groups && Array.isArray(image.groups) && 
            image.groups.some(groupId => featuredGroups.includes(groupId));
          const isRecentImage = showRecent && (() => {
            // 检查是否为最近图片（简单判断：7天内上传的图片）
            const uploadTime = new Date(image.uploaded_at).getTime();
            const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            return uploadTime > weekAgo;
          })();
          
          return (
            <List.Item key={image.id}> {/* 确保 List.Item 有 key */}
              <div style={{ position: 'relative' }}>
                {/* 特色标识 */}
                {(currentPath === '/' || currentPath === '/home') && (
                  <>
                    {isFeaturedImage && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'linear-gradient(45deg, #ff6b6b, #ffa500)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        ⭐ 特色
                      </div>
                    )}
                    {!isFeaturedImage && isFeaturedGroupImage && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        📂 分组
                      </div>
                    )}
                    {!isFeaturedImage && !isFeaturedGroupImage && isRecentImage && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        🆕 最新
                      </div>
                    )}
                  </>
                )}
                <ImageCard
                  id={image.id}
                  name={image.name || 'Untitled'}
                  description={image.description}
                  imageUrl={image.image}
                  thumbnailUrl={image.thumbnail || image.image}
                  selected={isSelected}
                  onSelect={selectionMode ? handleImageSelect : undefined}
                  showActions={true}
                  onEdit={currentPath === '/my-photos' ? handleEdit : undefined}
                  ownerUsername={typeof image.owner === 'string' ? image.owner : (image.owner ? `User ID: ${image.owner}` : undefined)} // 使用 image.owner
                  uploadDate={image.uploaded_at} // 传递上传日期
                  isHomepageCard={currentPath === '/' || currentPath === '/home'} // 设置 isHomepageCard
                />
              </div>
            </List.Item>
          );
        }}
      />
      {/* 添加调试信息，显示当前布局参数 */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ margin: '20px 0', padding: '10px', background: '#f5f5f5', borderRadius: '4px', color: '#888', fontSize: '12px' }}>
          <details>
            <summary>调试信息：当前布局参数</summary>
            <pre>
              {JSON.stringify({ 
                columns, 
                imageSpacing, 
                gridPadding, 
                filteredImages: filteredImages.length,
                featuredImages,
                featuredGroups,
                showRecent,
                recentCount
              }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default ImageGrid;