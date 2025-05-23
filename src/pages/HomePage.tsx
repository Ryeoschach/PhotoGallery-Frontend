import React, { useEffect } from 'react';
import { Row, Col, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchImages, selectImagesStatus, setFilter } from '../features/images/imagesSlice';
import ImageGrid from '../features/images/ImageGrid';
import GroupSelector from '../features/images/GroupSelector';
import PageCard from '../components/PageCard';
import LoadingState from '../components/LoadingState';
import type { AppDispatch } from '../app/store';

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const imagesStatus = useSelector(selectImagesStatus);
  
  // 确保在首页加载所有照片，无论从哪个页面导航过来
  useEffect(() => {
    // 始终在加载首页时重置过滤器为'all'
    console.log('HomePage: 重置过滤器为"all"并加载所有照片');
    dispatch(setFilter('all'));
    
    // 触发照片加载
    dispatch(fetchImages());
  }, [dispatch]);
  
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
