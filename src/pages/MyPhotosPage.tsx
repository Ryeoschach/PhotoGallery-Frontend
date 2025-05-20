import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Typography, Modal, Space, Alert } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import ImageGrid from '../features/images/ImageGrid';
import UploadForm from '../features/images/ImageUploadForm';
import { fetchImages, selectMyImages, selectImagesStatus } from '../features/images/imagesSlice';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import type { AppDispatch } from '../app/store';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

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
  
  // 重要：移除条件返回，改为条件渲染
  return (
    <div className="my-photos-container">
      <Card
        title={<Title level={2} style={{ margin: 0 }}>我的照片</Title>}
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleOpenUploadModal}
            >
              上传照片
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={imagesStatus === 'loading'}
            >
              刷新
            </Button>
          </Space>
        }
        bordered={false}
      >
        {!isAuthenticated ? (
          <Alert
            message="需要登录"
            description="请登录以查看您的照片"
            type="info"
            showIcon
          />
        ) : myImages.length === 0 ? (
          <Alert
            message="没有照片"
            description="您还没有上传任何照片，点击上方的上传照片按钮开始上传"
            type="info"
            showIcon
          />
        ) : (
          <ImageGrid selectionMode={true} filter="mine" />
        )}
      </Card>

      <Modal
        title="上传新照片"
        open={isUploadModalVisible}
        onCancel={handleCloseUploadModal}
        footer={null}
        destroyOnClose={true}
      >
        <UploadForm onSuccess={handleCloseUploadModal} />
      </Modal>
    </div>
  );
};

export default MyPhotosPage;