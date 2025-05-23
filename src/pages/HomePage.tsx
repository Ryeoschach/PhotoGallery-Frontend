import React, { useEffect } from 'react';
import { Row, Col, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchImages, selectImagesStatus, selectSelectedGroupId } from '../features/images/imagesSlice';
import ImageGrid from '../features/images/ImageGrid';
import GroupSelector from '../features/images/GroupSelector';
import PageCard from '../components/PageCard';
import LoadingState from '../components/LoadingState';
import type { AppDispatch } from '../app/store';

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const imagesStatus = useSelector(selectImagesStatus);
  const selectedGroupId = useSelector(selectSelectedGroupId);
  
  // 确保在首页加载所有照片，无论从哪个页面导航过来
  useEffect(() => {
    // 仅在未加载或加载失败时重新获取照片
    if (imagesStatus === 'idle' || imagesStatus === 'failed') {
      console.log('HomePage: Loading all images. Current status:', imagesStatus);
      dispatch(fetchImages()); // 不传递mine参数，获取所有照片
    }
  }, [dispatch, imagesStatus]);

  // 记录分组过滤的变化，用于调试
  useEffect(() => {
    console.log('HomePage: selectedGroupId changed:', selectedGroupId);
  }, [selectedGroupId]);
  
  return (
    <div className="fade-in">
      <PageCard
        title="欢迎来到照片库"
        subtitle="一个用于管理用户和照片的React + Django应用程序"
      >
        <Row gutter={[16, 24]}>
          <Col span={24}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <GroupSelector />
              </div>
            </Space>
          </Col>
        </Row>
        
        <LoadingState status={imagesStatus}>
          {/* 显式传递filter="all"，确保不受其他页面影响 */}
          <ImageGrid filter="all" />
        </LoadingState>
      </PageCard>
    </div>
  );
};

export default HomePage;
