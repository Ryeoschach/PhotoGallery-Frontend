import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../app/store';
import type { Image } from '../features/images/types';
import styles from './FeaturedPhoto.module.css';

interface FeaturedPhotoProps {
  imageId: number; // 特色照片的ID
}

/**
 * 特色照片展示组件
 * 完全展示单张特色照片，点击可进入详情页面
 */
const FeaturedPhoto: React.FC<FeaturedPhotoProps> = ({ imageId }) => {
  const navigate = useNavigate();
  
  // 从Redux状态中获取图片数据
  const image = useSelector((state: RootState) => 
    state.images.list.find((img: Image) => img.id === imageId)
  );

  // 如果找不到图片，不渲染任何内容
  if (!image) {
    return null;
  }

  // 点击处理函数，导航到图片详情页
  const handleClick = () => {
    navigate(`/images/${image.id}`);
  };

  return (
    <div className={styles.featuredPhotoContainer}>
      <div className={styles.featuredHeader}>
        <h2 className={styles.featuredTitle}>{image.name}</h2>
      </div>
      
      <div className={styles.featuredImageWrapper} onClick={handleClick}>
        <img
          src={image.image}
          alt={image.name}
          className={styles.featuredImage}
        />
        
        {/* 图片信息覆盖层 */}
        <div className={styles.imageOverlay}>
          <div className={styles.imageInfo}>
            <h3 className={styles.imageName}>{image.name}</h3>
            {image.description && (
              <p className={styles.imageDescription}>{image.description}</p>
            )}
            <div className={styles.imageMetadata}>
              <span className={styles.metadata}>
                📸 {image.owner_username || `用户${image.owner || image.user}`}
              </span>
              <span className={styles.metadata}>
                📅 {new Date(image.uploaded_at).toLocaleDateString('zh-CN')}
              </span>
              {image.width && image.height && (
                <span className={styles.metadata}>
                  📐 {image.width} × {image.height}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* 点击提示 */}
        <div className={styles.clickHint}>
          <span>点击查看详情</span>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPhoto;
