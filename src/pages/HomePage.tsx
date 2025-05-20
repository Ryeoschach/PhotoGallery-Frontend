import React, { useEffect } from 'react';
import { Typography, Row, Col, Space } from 'antd';
// import { UserOutlined } from '@ant-design/icons';
// import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchImages, selectImagesStatus } from '../features/images/imagesSlice';
import ImageGrid from '../features/images/ImageGrid';
import GroupSelector from '../features/images/GroupSelector';
import type { AppDispatch } from '../app/store';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const imagesStatus = useSelector(selectImagesStatus);
  
  // 确保在首页加载所有照片，无论从哪个页面导航过来
  useEffect(() => {
    // 仅在未加载或加载失败时重新获取照片
    if (imagesStatus === 'idle' || imagesStatus === 'failed') {
      console.log('HomePage: Loading all images. Current status:', imagesStatus);
      dispatch(fetchImages()); // 不传递mine参数，获取所有照片
    }
  }, [dispatch, imagesStatus]);
  
  return (
    <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
      <Title level={1} style={{ textAlign: 'center' }}>
        Welcome to Photo Gallery
      </Title>
      <Paragraph style={{ textAlign: 'center', fontSize: '16px' }}>
        A React + Django application for managing users and photos
      </Paragraph>
      
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ marginBottom: 16 }}>
              <GroupSelector />
            </div>
          </Space>
        </Col>
      </Row>
      
      {/* 显式传递filter="all"，确保不受其他页面影响 */}
      <ImageGrid filter="all" />
    </div>
  );
};

export default HomePage;
