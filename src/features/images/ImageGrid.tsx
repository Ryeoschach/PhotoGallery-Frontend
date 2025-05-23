import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { List } from 'antd';
import { 
  selectFilteredImages, 
  selectSelectedImageIds,
  selectImagesStatus,
  toggleImageSelection,
  fetchImages
} from './imagesSlice';
import type { AppDispatch } from '../../app/store';
import ImageCard from '../../components/ImageCard';
import EmptyState from '../../components/EmptyState';
import './ImageGrid.css'; // 保留原CSS文件导入

interface ImageGridProps {
  selectionMode?: boolean;  // 是否启用选择模式
  filter?: string;          // 过滤条件，如 'mine'、'all' 等
}

const ImageGrid: React.FC<ImageGridProps> = ({ selectionMode = false, filter = 'all' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const images = useSelector(selectFilteredImages);
  const selectedImageIds = useSelector(selectSelectedImageIds);
  const currentUser = useSelector((state: any) => state.auth.user); // 假设 currentUser.id 是 number, currentUser.username 是 string
  
  // 使用选择器获取图片加载状态
  const imagesStatus = useSelector(selectImagesStatus);
  
  // 使用ref来追踪之前的filter和pathname，防止重复请求
  const prevFilterRef = useRef<string>(filter);
  const prevPathRef = useRef<string>(window.location.pathname);
  const initialLoadDoneRef = useRef<boolean>(false);
  
  // 在组件挂载和filter/pathname变化时加载图片数据
  useEffect(() => {
    const currentPath = window.location.pathname;
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
      if (filter === 'mine') {
        console.log('跳过请求 - 已经由MyPhotosPage处理');
        return;
      }
    }
    
    // 在首页上，不在这里加载照片，改由HomePage组件负责
    if (currentPath === '/' || currentPath === '/home') {
      console.log('在首页上 - 由HomePage组件处理加载');
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
  }, [dispatch, filter, window.location.pathname, imagesStatus]);
  
  // 单独获取selectedGroupId，使其成为组件状态的一部分
  const selectedGroupId = useSelector((state: any) => state.images.selectedGroupId);
  
  const filteredImages = React.useMemo(() => {
    console.log('过滤图片数据:', { 
      filter, 
      currentUser, 
      totalImages: images.length, 
      selectedGroupId,
      imageSample: images.length > 0 ? images[0] : 'No images',
      allOwners: images.map(img => img?.owner)
    });

    // 如果没有图片，直接返回空数组
    if (!images || images.length === 0) {
      return [];
    }

    // 首页上，确保总是返回所有照片
    if (window.location.pathname === '/' || window.location.pathname === '/home') {
      console.log('首页图片过滤，selectedGroupId:', selectedGroupId);
      
      if (selectedGroupId) {
        console.log(`首页应用分组过滤，分组ID: ${selectedGroupId}，总图片数: ${images.length}`);
        const filtered = images.filter(img => 
          img && img.groups && Array.isArray(img.groups) && 
          img.groups.includes(selectedGroupId)
        );
        console.log(`首页分组过滤后剩余图片: ${filtered.length}张`);
        return filtered;
      }
      return images;
    }

    if (filter === 'mine' && currentUser) {
      return images.filter(img => {
        if (!img) return false; // 图像对象本身可能为空
        if (img.owner === null || img.owner === undefined) {
          console.log('图片没有所有者:', img.id, img.name);
          return false; 
        }
        
        // 根据你的实际数据结构进行调整
        // 如果 owner 存储的是数字 ID
        if (typeof img.owner === 'number') {
          const isOwner = img.owner === currentUser.id;
          console.log(`比较图片 ${img.id} - 所有者ID ${img.owner} vs 用户ID ${currentUser.id}: ${isOwner}`);
          return isOwner;
        }
        
        // 如果 owner 存储的是字符串
        if (typeof img.owner === 'string') {
          // 检查是否为字符串形式的数字 ID
          if (!isNaN(Number(img.owner))) {
            const isOwner = Number(img.owner) === currentUser.id;
            console.log(`比较图片 ${img.id} - 所有者ID(字符串数字) ${img.owner} vs 用户ID ${currentUser.id}: ${isOwner}`);
            return isOwner;
          }
          // 否则认为是用户名
          const isOwner = img.owner === currentUser.username;
          console.log(`比较图片 ${img.id} - 所有者名称 ${img.owner} vs 用户名 ${currentUser.username}: ${isOwner}`);
          return isOwner;
        }
        
        return false; // 如果 owner 类型不匹配
      });
    }
    return images;
  }, [images, filter, currentUser, selectedGroupId]);

  // 处理图片选择/取消选择
  const handleImageSelect = (id: number) => {
    dispatch(toggleImageSelection(id));
  };
  
  // 如果没有图片，显示空状态
  if (filteredImages.length === 0) {
    return <EmptyState message="暂无图片" description="没有找到符合条件的图片" />;
  }

  return (
    <List
      grid={{
        gutter: 16,
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 4,
        xxl: 6,
      }}
      dataSource={filteredImages}
      renderItem={(image) => {
        if (!image) return null;
        
        const isSelected = selectedImageIds.includes(image.id);
        
        return (
          <List.Item>
            <ImageCard
              id={image.id}
              name={image.name || 'Untitled'}
              description={image.description}
              imageUrl={image.image}
              thumbnailUrl={image.thumbnail || image.image}
              selected={isSelected}
              onSelect={selectionMode ? handleImageSelect : undefined}
              clickable={true}
              showActions={false} // 在网格视图中不显示操作按钮，保持简洁
            />
          </List.Item>
        );
      }}
    />
  );
};

export default ImageGrid;