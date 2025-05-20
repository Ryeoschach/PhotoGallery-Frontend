import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Typography, Descriptions, Button, Form, Input, message } from 'antd';
import { UserOutlined, MailOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { selectCurrentUser, fetchUserProfile, selectAuthStatus, updateUserProfile } from '../features/auth/authSlice';
import type { AppDispatch } from '../app/store';

const { Title } = Typography;

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(selectCurrentUser);
  const status = useSelector(selectAuthStatus);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!currentUser) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, currentUser]);

  const handleEdit = () => {
    form.setFieldsValue({
      username: currentUser?.username,
      email: currentUser?.email,
      first_name: currentUser?.first_name,
      last_name: currentUser?.last_name,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await dispatch(updateUserProfile(values)).unwrap();
      message.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      message.error(`Failed to update profile: ${err.message || 'Unknown error'}`);
    }
  };

  if (!currentUser) {
    return <div>Loading profile...</div>;
  }

  return (
    <div>
      <Title level={2}>My Profile</Title>
      
      <Card>
        {!isEditing ? (
          <>
            <Descriptions 
              bordered 
              column={1}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>User Information</span>
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </Button>
                </div>
              }
            >
              <Descriptions.Item label="Username">
                <UserOutlined /> {currentUser.username}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined /> {currentUser.email}
              </Descriptions.Item>
              <Descriptions.Item label="First Name">
                {currentUser.first_name || 'Not provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Name">
                {currentUser.last_name || 'Not provided'}
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : (
          <Form 
            form={form} 
            layout="vertical" 
            initialValues={{
              username: currentUser.username,
              email: currentUser.email,
              first_name: currentUser.first_name,
              last_name: currentUser.last_name,
            }}
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Please enter your username' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Username" disabled />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
            
            <Form.Item
              name="first_name"
              label="First Name"
              rules={[{ required: true, message: 'Please enter your first name' }]}
            >
              <Input placeholder="First Name" />
            </Form.Item>
            
            <Form.Item
              name="last_name"
              label="Last Name"
              rules={[{ required: true, message: 'Please enter your last name' }]}
            >
              <Input placeholder="Last Name" />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSave}
                loading={status === 'loading'}
                style={{ marginRight: 8 }}
              >
                Save
              </Button>
              <Button 
                icon={<CloseOutlined />} 
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;