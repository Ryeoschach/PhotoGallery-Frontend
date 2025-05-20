// import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, selectAuthStatus } from './authSlice';
import type { RegisterRequest } from './types';
import type { AppDispatch } from '../../app/store';

const { Title, Text } = Typography;

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const status = useSelector(selectAuthStatus);
  const [form] = Form.useForm();

  const onFinish = (values: RegisterRequest) => {
    dispatch(registerUser(values))
      .unwrap()
      .then(() => {
        message.success('注册成功！请登录');
        navigate('/login');
      })
      .catch(() => {
        // 错误已在reducer中处理
      });
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '24px 0' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center' }}>注册新账号</Title>
        
        <Form
          name="register"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名！' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="电子邮箱"
            rules={[
              { required: true, message: '请输入电子邮箱！' },
              { type: 'email', message: '请输入有效的邮箱地址！' }
            ]}
          >
            <Input prefix={<MailOutlined />} type="email" placeholder="请输入电子邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码！' },
              { min: 6, message: '密码至少6个字符' }
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            name="password2"
            label="确认密码"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: '请确认密码！' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不匹配！'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={status === 'loading'}
            >
              注册
            </Button>
          </Form.Item>
        </Form>
        
        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Text>已有账号？</Text> <Link to="/login">立即登录</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;