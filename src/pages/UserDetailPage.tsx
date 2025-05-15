import React from 'react';
import UserDetail from '../features/users/UserDetail';

const UserDetailPage: React.FC = () => {
  return (
    <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
      <UserDetail />
    </div>
  );
};

export default UserDetailPage;