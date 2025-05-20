import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card, Typography, Form, Input, Button, Avatar, message, Spin, Tabs
} from 'antd';
import { UserOutlined, MailOutlined, KeyOutlined } from '@ant-design/icons';
import {
  selectCurrentUser,
  selectAuthStatus,
  fetchUserProfile,
  updateUserProfile
} from './authSlice';
import type { AppDispatch } from '../../app/store';
import type { UserUpdateRequest } from './types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectCurrentUser);
  const status = useSelector(selectAuthStatus);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      });
    }
  }, [user, form]);

  const handleUpdateProfile = (values: UserUpdateRequest) => {
    dispatch(updateUserProfile(values))
      .unwrap()
      .then(() => {
        message.success('个人资料更新成功！');
      })
      .catch((err) => {
        message.error(`更新失败: ${err}`);
      });
  };

  const handleUpdatePassword = (values: { old_password: string; new_password: string }) => {
    dispatch(updateUserProfile({
      old_password: values.old_password,
      password: values.new_password
    }))
      .unwrap()
      .then(() => {
        message.success('密码更新成功！');
        passwordForm.resetFields();
      })
      .catch((err) => {
        message.error(`密码更新失败: ${err}`);
      });
  };

  if (status === 'loading' && !user) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (!user) {
    return <div>未登录或加载用户信息失败</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 0' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Avatar size={64} icon={<UserOutlined />} />
          <div style={{ marginLeft: 16 }}>
            <Title level={3} style={{ margin: 0 }}>{user.username}</Title>
            <Text type="secondary">{user.email}</Text>
          </div>
        </div>

        <Tabs defaultActiveKey="profile">
          <TabPane tab="个人资料" key="profile">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
              initialValues={{
                username: user.username,
                email: user.email,
                first_name: user.first_name || '',
                last_name: user.last_name || ''
              }}
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名！' }]}
              >
                <Input prefix={<UserOutlined />} disabled />
              </Form.Item>

              <Form.Item
                name="email"
                label="电子邮箱"
                rules={[
                  { required: true, message: '请输入电子邮箱！' },
                  { type: 'email', message: '请输入有效的邮箱地址！' }
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>

              <Form.Item name="first_name" label="名">
                <Input />
              </Form.Item>

              <Form.Item name="last_name" label="姓">
                <Input />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={status === 'loading'}
                >
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="修改密码" key="password">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleUpdatePassword}
            >
              <Form.Item
                name="old_password"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码！' }]}
              >
                <Input.Password prefix={<KeyOutlined />} />
              </Form.Item>

              <Form.Item
                name="new_password"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码！' },
                  { min: 6, message: '密码至少6个字符' }
                ]}
                hasFeedback
              >
                <Input.Password prefix={<KeyOutlined />} />
              </Form.Item>

              <Form.Item
                name="confirm_password"
                label="确认新密码"
                dependencies={['new_password']}
                hasFeedback
                rules={[
                  { required: true, message: '请确认新密码！' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('new_password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不匹配！'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<KeyOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={status === 'loading'}
                >
                  更新密码
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProfilePage;