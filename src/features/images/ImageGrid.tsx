import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { List, Card, Image as AntImage, Checkbox } from 'antd';
import { Link } from 'react-router-dom';
import { 
  selectFilteredImages, 
  selectSelectedImageIds,
  selectImagesStatus,
  toggleImageSelection,
  fetchImages
} from './imagesSlice';
import type { AppDispatch } from '../../app/store';
// import type { Image } from './types';

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
    
    // 在首页上，始终使用filter="all"加载所有照片
    if (currentPath === '/' || currentPath === '/home') {
      // 如果已经加载了照片，且不是从"我的照片"页面导航过来的，可以跳过
      if (!pathChanged && initialLoadDoneRef.current && imagesStatus === 'succeeded') {
        console.log('跳过请求 - 已经在首页加载了所有照片');
        return;
      }
      
      console.log('在首页加载所有照片');
      dispatch(fetchImages());
      initialLoadDoneRef.current = true;
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
  
  const filteredImages = React.useMemo(() => {
    console.log('过滤图片数据:', { 
      filter, 
      currentUser, 
      totalImages: images.length, 
      imageSample: images.length > 0 ? images[0] : 'No images',
      allOwners: images.map(img => img?.owner)
    });

    // 如果没有图片，直接返回空数组
    if (!images || images.length === 0) {
      return [];
    }

    // 首页上，确保总是返回所有照片
    if (window.location.pathname === '/' || window.location.pathname === '/home') {
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
  }, [images, filter, currentUser]);

  // 处理图片选择/取消选择
  const handleImageSelect = (id: number) => {
    dispatch(toggleImageSelection(id));
  };

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
            <div style={{ position: 'relative' }}>
              {selectionMode && (
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleImageSelect(image.id)}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: 4,
                    padding: 4
                  }}
                />
              )}
              <Card
                hoverable
                cover={
                  <Link to={`/images/${image.id}`}>
                    <AntImage
                      src={image?.thumbnail || image?.image}
                      alt={image?.name || 'Image'}
                      style={{ 
                        width: '100%', 
                        height: 200, 
                        objectFit: 'cover',
                        filter: isSelected ? 'brightness(0.8)' : 'none'
                      }}
                      preview={false}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
                    />
                  </Link>
                }
              >
                <Card.Meta
                  title={image?.name || 'Untitled'}
                  // description={
                  //   <div>
                  //     {image?.description && (
                  //       <Typography.Paragraph ellipsis={{ rows: 2 }}>
                  //         {image.description}
                  //       </Typography.Paragraph>
                  //     )}
                  //   </div>
                  // }
                />
              </Card>
            </div>
          </List.Item>
        );
      }}
    />
  );
};

export default ImageGrid;