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
import './ImageGrid.css'; // 保留原CSS文件导入
import { useNavigate } from 'react-router-dom'; // 导入 useNavigate

interface ImageGridProps {
  selectionMode?: boolean;  // 是否启用选择模式
  filter?: string;          // 过滤条件，如 'mine'、'all' 等
}

const ImageGrid: React.FC<ImageGridProps> = ({ selectionMode = false, filter = 'all' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); // 初始化 useNavigate
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
  const currentPath = window.location.pathname;
  
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
  
  // 根据过滤器过滤图片
  const filteredImages = useMemo(() => {
    console.log(
      'ImageGrid: 应用过滤器', 
      'effectiveFilter:', effectiveFilter, 
      'currentUser:', currentUser?.id, 
      'selectedGroupId:', selectedGroupId
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
    
    return result;
  }, [images, effectiveFilter, currentUser, selectedGroupId]); // 使用effectiveFilter替代filter

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
              showActions={true} // Keep actions bar visible (e.g., for "View")
              onEdit={currentPath === '/my-photos' ? handleEdit : undefined} // Conditionally pass onEdit
            />
          </List.Item>
        );
      }}
    />
  );
};

export default ImageGrid;