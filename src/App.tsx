import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import './App.css';

const { Header, Content, Footer } = Layout;

// 定义菜单项
const menuItems: MenuProps['items'] = [
  {
    key: '1',
    label: <Link to="/">Home</Link>,
  },
  // {
  //   key: '2',
  //   label: <Link to="/users">Users</Link>,
  // },
];

const App: React.FC = () => {
  return (
    <Layout style={{ 
      width: '100%', 
      minWidth: '320px', 
      maxWidth: '1280px', 
      margin: '0 auto',
      padding: 0,
      minHeight: '100vh'
    }}>
      <Header className="header" style={{ position: 'sticky', top: 10, zIndex: 1, width: '100%' }}>
        <div className="logo">Photo Gallery</div>
        <Menu 
          theme="dark" 
          mode="horizontal" 
          defaultSelectedKeys={['1']} 
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
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
