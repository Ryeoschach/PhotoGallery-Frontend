import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Avatar, Typography, Descriptions, Button, Spin, Alert } from 'antd';
import { UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import {
  fetchUserDetail,
  selectUserDetail,
  getUserDetailStatus,
  getUserDetailError,
} from './usersSlice';
import type { AppDispatch } from '../../app/store';

const { Title } = Typography;

const UserDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  
  const user = useSelector(selectUserDetail);
  const status = useSelector(getUserDetailStatus);
  const error = useSelector(getUserDetailError);

  useEffect(() => {
    if (username && (status === 'idle' || !user || user.username !== username)) {
      dispatch(fetchUserDetail(username));
    }
  }, [username, status, user, dispatch]);

  const handleBack = () => {
    navigate('/users');
  };

  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', marginTop: 50, width: '100%' }}>
        <Spin size="large" tip="Loading user details..." />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
          Back to Users
        </Button>
        <Alert message="Error" description={`Failed to load user details: ${error}`} type="error" showIcon />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
          Back to Users
        </Button>
        <Alert message="User not found" description="The requested user does not exist." type="warning" showIcon />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
      <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
        Back to Users
      </Button>
      
      <Card style={{ width: '100%' }} className="responsive-card">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          marginBottom: 24,
          textAlign: 'center'
        }}>
          <Avatar size={64} icon={<UserOutlined />} />
          <Title level={2} style={{ margin: '16px 0 0 0' }}>{user.username}</Title>
        </div>
        
        <Descriptions 
          bordered 
          column={{ xxl: 3, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          style={{ width: '100%' }}
        >
          <Descriptions.Item label="User ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email || 'No email provided'}</Descriptions.Item>
          {/* 可以根据实际 API 返回的用户数据添加更多字段 */}
        </Descriptions>
      </Card>
    </div>
  );
};

export default UserDetail;