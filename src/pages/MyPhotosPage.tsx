import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, Space, Alert } from 'antd';
import { PlusOutlined, ReloadOutlined, PictureOutlined } from '@ant-design/icons';
import ImageGrid from '../features/images/ImageGrid';
import UploadForm from '../features/images/ImageUploadForm';
import { fetchImages, selectMyImages, selectImagesStatus } from '../features/images/imagesSlice';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import type { AppDispatch } from '../app/store';
import { useNavigate } from 'react-router-dom';

const MyPhotosPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const myImages = useSelector(selectMyImages);
  const imagesStatus = useSelector(selectImagesStatus);
  
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  
  // 使用ref来跟踪是否已经发送了初始请求
  const initialLoadDoneRef = useRef(false);
  
  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login', { state: { from: '/my-photos' } });
    }
  }, [isAuthenticated, navigate]);
  
  // 当组件挂载时获取用户照片
  useEffect(() => {
    // 只有当用户已认证且初次加载时才发送请求
    if (isAuthenticated && !initialLoadDoneRef.current) {
      console.log('初始加载用户照片'); 
      dispatch(fetchImages({ mine: true }));
      initialLoadDoneRef.current = true;
    }
  }, [dispatch, isAuthenticated]);

  // 处理上传模态框
  const handleOpenUploadModal = () => {
    setIsUploadModalVisible(true);
  };
  
  const handleCloseUploadModal = () => {
    setIsUploadModalVisible(false);
    // 避免重复请求，让 ImageUploadForm 组件自己处理重新加载
  };
  
  // 处理刷新按钮
  const handleRefresh = () => {
    console.log('手动刷新用户照片');
    // 直接调用 dispatch，不使用 setRefreshKey
    dispatch(fetchImages({ mine: true }));
  };
  
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">我的照片</h1>
      </div>
      
      <div className="modern-card">
        <div className="modern-card-header">
          <div></div>
          <Space>
            <button 
              className="modern-button modern-button-primary" 
              onClick={handleOpenUploadModal}
            >
              <PlusOutlined /> 上传照片
            </button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={imagesStatus === 'loading'}
            >
              刷新
            </Button>
          </Space>
        </div>
        
        <div className="modern-card-body">
          {!isAuthenticated ? (
            <Alert
              message="需要登录"
              description="请登录以查看您的照片"
              type="info"
              showIcon
            />
          ) : myImages.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><PictureOutlined /></span>
              <h3 className="empty-title">您还没有上传照片</h3>
              <p className="empty-description">点击上方的"上传照片"按钮开始上传您的照片</p>
              <Button type="primary" onClick={handleOpenUploadModal} icon={<PlusOutlined />}>
                上传第一张照片
              </Button>
            </div>
          ) : (
            <ImageGrid selectionMode={true} filter="mine" />
          )}
        </div>
      </div>

      <Modal
        title="上传新照片"
        open={isUploadModalVisible}
        onCancel={handleCloseUploadModal}
        footer={null}
        destroyOnClose={true}
        width={700}
        centered
      >
        <UploadForm onSuccess={handleCloseUploadModal} />
      </Modal>
    </div>
  );
};

export default MyPhotosPage;