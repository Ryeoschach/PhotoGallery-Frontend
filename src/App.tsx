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
      minWidth: '320px', 
      maxWidth: '1280px', 
      margin: '0 auto',
      padding: 0,
      minHeight: '100vh'
    }}>
      <Header className="header" style={{ 
        position: 'sticky', 
        top: 10, 
        zIndex: 1, 
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="logo" style={{ marginRight: 20 }}>
            <PictureOutlined /> Photo Gallery
          </div>
          <Menu 
            theme="dark" 
            mode="horizontal" 
            defaultSelectedKeys={['home']} 
            items={menuItems}
            style={{ flex: 1, minWidth: 0 }}
          />
        </div>
        
        <div>
          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                <span style={{ color: 'white' }}>{currentUser?.username || '用户'}</span>
              </div>
            </Dropdown>
          ) : (
            <div>
              <Button type="link" onClick={() => navigate('/login')}>
                <LoginOutlined /> 登录
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                注册
              </Button>
            </div>
          )}
        </div>
      </Header>
      
      <Content className="content">
        <div className="site-layout-content">
          <Outlet />
        </div>
      </Content>
      
      <Footer className="footer">Photo Gallery ©2025 Created with Ant Design</Footer>
    </Layout>
  );
}

export default App;
