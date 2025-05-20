import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, selectIsAuthenticated, selectAuthStatus } from './authSlice';
import type { LoginRequest } from './types';
import type { AppDispatch } from '../../app/store';

const { Title, Text } = Typography;

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
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '24px 0' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center' }}>登录</Title>
        
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={status === 'loading'}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        
        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Text>没有账号？</Text> <Link to="/register">立即注册</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;