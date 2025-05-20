import React from 'react';
import { Typography, Row, Col, Space } from 'antd';
// import { UserOutlined } from '@ant-design/icons';
// import { Link } from 'react-router-dom';
import ImageGrid from '../features/images/ImageGrid';
import GroupSelector from '../features/images/GroupSelector';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
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
      
      {/* <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card 
            title="User Management" 
            hoverable
            style={{ height: '100%' }}
          >
            <Paragraph>
              Browse and manage user accounts in the system.
            </Paragraph>
            <Button type="primary" icon={<UserOutlined />}>
              <Link to="/users">View Users</Link>
            </Button>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card 
            title="Photos" 
            hoverable
            style={{ height: '100%' }}
          >
            <Paragraph>
              Browse the photo collection from all users.
            </Paragraph>
            <Button type="primary">
              <Link to="/photos">View Photos</Link>
            </Button>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card 
            title="About" 
            hoverable
            style={{ height: '100%' }}
          >
            <Paragraph>
              Learn more about this application and how it was built.
            </Paragraph>
            <Button type="primary">
              <Link to="/about">About Us</Link>
            </Button>
          </Card>
        </Col>
      </Row> */}
      <ImageGrid />
    </div>
  );
};

export default HomePage;
