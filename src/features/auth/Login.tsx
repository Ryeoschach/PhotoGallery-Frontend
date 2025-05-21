import React, { useEffect } from 'react';
import { Form, Input, Button, message, Divider, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, selectIsAuthenticated, selectAuthStatus } from './authSlice';
import type { LoginRequest } from './types';
import type { AppDispatch } from '../../app/store';

const { Text } = Typography;

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const status = useSelector(selectAuthStatus);

  // 如果已登录则重定向到首页或上一个页面
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const onFinish = (values: LoginRequest) => {
    dispatch(loginUser(values))
      .unwrap()
      .then(() => {
        message.success('登录成功！');
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      })
      .catch(() => {
        // 错误已在reducer中处理
      });
  };

  return (
    <div className="fade-in" style={{ maxWidth: 400, margin: '0 auto', padding: 'var(--spacing-xxl) 0' }}>
      <div className="modern-card">
        <div className="modern-card-body" style={{ padding: 'var(--spacing-xl)' }}>
          <div className="page-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h1 className="page-title" style={{ fontSize: 'var(--font-size-xl)' }}>登录</h1>
            <p className="page-subtitle">登录您的账号访问照片库</p>
          </div>
          
          <Form
            name="login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            className="modern-form"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名！' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: 'var(--primary-color)' }} />} 
                placeholder="请输入用户名" 
                size="large"
                className="modern-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码！' }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: 'var(--primary-color)' }} />} 
                placeholder="请输入密码" 
                size="large"
                className="modern-input"
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 'var(--spacing-xl)' }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={status === 'loading'}
                size="large"
                className="modern-button modern-button-primary"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
          
          <Divider style={{ margin: 'var(--spacing-xl) 0' }} />
          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: 'var(--text-secondary)' }}>没有账号？</Text>{' '}
            <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
              立即注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;