import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { UserOutlined, LoginOutlined, LogoutOutlined, SettingOutlined, PictureOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { MenuProps } from 'antd';
import './App.css';
import { selectCurrentUser, selectIsAuthenticated, logoutUser, checkAuthStatus } from './features/auth/authSlice';
import type { AppDispatch } from './app/store';

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // 在应用加载时检查认证状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Found token in localStorage, restoring session');
      dispatch(checkAuthStatus());
    }
  }, [dispatch]);

  // 退出登录
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  // 根据认证状态动态生成菜单
  const menuItems: MenuProps['items'] = [
    {
      key: 'home',
      label: <Link to="/">首页</Link>,
    },
    {
      key: 'my-photos',
      label: <Link to="/my-photos">我的照片</Link>,
      style: { display: isAuthenticated ? 'block' : 'none' }
    },
    {
      key: 'groups',
      label: <Link to="/groups">分组管理</Link>,
      style: { display: isAuthenticated ? 'block' : 'none' }
    }
  ];

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">用户信息</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">账号设置</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>退出登录</span>,
    }
  ];

  return (
    <Layout style={{ 
      width: '100%', 
      margin: '0 auto',
      padding: 0,
      minHeight: '100vh',
      background: 'var(--background)'
    }}>
      <Header className="header">
        <div style={{ 
          maxWidth: 'var(--content-width)', 
          margin: '0 auto', 
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          height: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="logo">
              <PictureOutlined /> Photo Gallery
            </div>
            <Menu 
              theme="light" 
              mode="horizontal" 
              defaultSelectedKeys={['home']} 
              items={menuItems}
              style={{ 
                borderBottom: 'none',
                background: 'transparent'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isAuthenticated ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '40px',
                  transition: 'all 0.3s ease'
                }}>
                  <Avatar 
                    size="default" 
                    icon={<UserOutlined />} 
                    style={{ 
                      marginRight: 8,
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary-color)'
                    }} 
                  />
                  <span style={{ color: 'var(--text-primary)' }}>
                    {currentUser?.username || '用户'}
                  </span>
                </div>
              </Dropdown>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button 
                  type="text" 
                  onClick={() => navigate('/login')}
                  style={{ color: 'var(--primary-color)' }}
                >
                  <LoginOutlined /> 登录
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/register')}
                  style={{ 
                    backgroundColor: 'var(--primary-color)',
                    borderRadius: 'var(--border-radius-sm)'
                  }}
                >
                  注册
                </Button>
              </div>
            )}
          </div>
        </div>
      </Header>
      
      <Content className="content">
        <div className="site-layout-content fade-in">
          <Outlet />
        </div>
      </Content>
      
      <Footer className="footer">
        <div style={{ maxWidth: 'var(--content-width)', margin: '0 auto' }}>
          Photo Gallery ©2025 Created with Ant Design
        </div>
      </Footer>
    </Layout>
  );
}

export default App;
