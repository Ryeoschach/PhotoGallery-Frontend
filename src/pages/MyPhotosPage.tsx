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
  const [refreshKey, setRefreshKey] = useState(0); // 用于强制刷新组件
  
  // 使用ref来跟踪是否已经发送了初始请求
  const initialFetchDoneRef = useRef<boolean>(false);
  
  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login', { state: { from: '/my-photos' } });
    }
  }, [isAuthenticated, navigate]);
  
  // 确保在组件挂载时加载照片数据
  useEffect(() => {
    // 仅在以下情况加载照片：
    // 1. 用户已登录
    // 2. 不在加载状态
    // 3. 尚未执行初始加载或强制刷新被触发(refreshKey变化)
    if (isAuthenticated && imagesStatus !== 'loading' && 
        (!initialFetchDoneRef.current || refreshKey > 0)) {
      console.log('Loading images for authenticated user. Status:', imagesStatus, 
                  'Initial fetch done:', initialFetchDoneRef.current);
      dispatch(fetchImages({ mine: true }));
      initialFetchDoneRef.current = true;
    }
  }, [isAuthenticated, dispatch, imagesStatus, refreshKey]);

  // 处理上传模态框
  const handleOpenUploadModal = () => {
    setIsUploadModalVisible(true);
  };
  
  const handleCloseUploadModal = () => {
    setIsUploadModalVisible(false);
    // 关闭模态框后刷新照片列表，获取最新上传的照片
    if (imagesStatus !== 'loading') {
      console.log('Upload modal closed, refreshing images');
      setRefreshKey(prevKey => prevKey + 1); // 刷新组件会触发上面的useEffect
    }
  };
  
  // 刷新照片列表
  const handleRefresh = () => {
    if (imagesStatus !== 'loading') {
      console.log('Manual refresh triggered');
      setRefreshKey(prevKey => prevKey + 1); // 这会触发上面的useEffect
    } else {
      console.log('已经在加载中，跳过刷新请求');
    }
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
          // 传递key属性，确保在refreshKey变化时组件会重新挂载
          <ImageGrid key={refreshKey} selectionMode={true} filter="mine" />
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