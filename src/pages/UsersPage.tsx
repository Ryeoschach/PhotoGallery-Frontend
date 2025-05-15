import React from 'react';
import UserList from '../features/users/UserList';

const UsersPage: React.FC = () => {
  return (
    <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
      <UserList />
    </div>
  );
};

export default UsersPage;