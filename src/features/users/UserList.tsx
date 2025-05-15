import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { List, Typography, Spin, Alert } from 'antd';
import {
  fetchUsers,
  selectAllUsers,
  getUsersStatus,
  getUsersError,
  clearCurrentUser,
} from './usersSlice';
import type { User } from './usersSlice';
import type { AppDispatch } from '../../app/store';

const UserList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectAllUsers);
  const status = useSelector(getUsersStatus);
  const error = useSelector(getUsersError);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchUsers());
    }
    
    // 组件挂载时清除当前用户详情
    dispatch(clearCurrentUser());
  }, [status, dispatch]);

  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px', width: '100%' }}>
        <Spin size="large" tip="Loading users..." />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <Alert 
        message="Error" 
        description={`Failed to load users: ${error}`} 
        type="error" 
        showIcon 
        style={{ width: '100%' }}
      />
    );
  }

  return (
    <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
      <Typography.Title level={2}>User List</Typography.Title>
      {users.length > 0 ? (
        <List
          className="user-list"
          bordered
          dataSource={users}
          style={{ width: '100%' }}
          renderItem={(user: User) => (
            <List.Item style={{ width: '100%' }}>
              <List.Item.Meta
                title={
                  <Link to={`/users/${user.username}`}>
                    {user.username}
                  </Link>
                }
                description={user.email || 'No email provided'}
                style={{ flex: 1 }}
              />
              <div>ID: {user.id}</div>
            </List.Item>
          )}
        />
      ) : (
        status === 'succeeded' && <Typography.Text>No users found.</Typography.Text>
      )}
    </div>
  );
};

export default UserList;