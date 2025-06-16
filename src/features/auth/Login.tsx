import React, { useEffect, useState, useRef } from 'react';
import { Form, Input, Button, Divider, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  loginUser, 
  selectIsAuthenticated, 
  selectAuthStatus, 
  selectAuthError,
  selectLastAttemptedCredentials,
  clearAuthError 
} from './authSlice';
import type { LoginRequest } from './types';
import type { AppDispatch } from '../../app/store';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from '../../services/toast';
import { validateLoginForm } from '../../utils/errorHandling';

const { Text } = Typography;

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  
  // Redux状态
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const status = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);
  const lastAttemptedCredentials = useSelector(selectLastAttemptedCredentials);
  
  // 本地状态
  const [showError, setShowError] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  
  // 用于自动聚焦到错误字段
  const usernameInputRef = useRef<any>(null);
  const passwordInputRef = useRef<any>(null);

  // 如果已登录则重定向到首页或上一个页面
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // 处理登录错误显示
  useEffect(() => {
    if (authError) {
      setShowError(true);
      
      // 显示Toast通知
      toast.showLoginError(authError);
      
      // 如果是特定字段错误，聚焦到对应输入框
      if (authError.inputField === 'username' && usernameInputRef.current) {
        setTimeout(() => usernameInputRef.current.focus(), 100);
      } else if (authError.inputField === 'password' && passwordInputRef.current) {
        setTimeout(() => passwordInputRef.current.focus(), 100);
      }
    }
  }, [authError]);

  // 清除错误消息
  const handleDismissError = () => {
    setShowError(false);
    dispatch(clearAuthError());
  };

  // 重试登录
  const handleRetry = () => {
    if (lastAttemptedCredentials) {
      dispatch(clearAuthError());
      setShowError(false);
      dispatch(loginUser(lastAttemptedCredentials));
    }
  };

  // 实时验证
  const handleFieldChange = () => {
    const values = form.getFieldsValue();
    const validation = validateLoginForm(values.username || '', values.password || '');
    setValidationErrors(validation.errors);
  };

  const onFinish = (values: LoginRequest) => {
    // 清除之前的错误
    dispatch(clearAuthError());
    setShowError(false);
    setValidationErrors({});
    
    // 表单验证
    const validation = validateLoginForm(values.username, values.password);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    dispatch(loginUser(values))
      .unwrap()
      .then(() => {
        // 显示成功消息
        toast.showLoginSuccess(values.username);
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      })
      .catch(() => {
        // 错误已在reducer和useEffect中处理
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

          {/* 错误提示 */}
          <ErrorMessage
            error={authError}
            visible={showError}
            onRetry={handleRetry}
            onDismiss={handleDismissError}
          />
          
          <Form
            form={form}
            name="login"
            layout="vertical"
            onFinish={onFinish}
            onFieldsChange={handleFieldChange}
            autoComplete="off"
            className="modern-form"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名！' }]}
              validateStatus={validationErrors.username ? 'error' : ''}
              help={validationErrors.username}
            >
              <Input 
                ref={usernameInputRef}
                prefix={<UserOutlined style={{ color: 'var(--primary-color)' }} />} 
                placeholder="请输入用户名" 
                size="large"
                className={`modern-input ${authError?.inputField === 'username' ? 'error-input' : ''}`}
                status={authError?.inputField === 'username' ? 'error' : undefined}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码！' }]}
              validateStatus={validationErrors.password ? 'error' : ''}
              help={validationErrors.password}
            >
              <Input.Password 
                ref={passwordInputRef}
                prefix={<LockOutlined style={{ color: 'var(--primary-color)' }} />} 
                placeholder="请输入密码" 
                size="large"
                className={`modern-input ${authError?.inputField === 'password' ? 'error-input' : ''}`}
                status={authError?.inputField === 'password' ? 'error' : undefined}
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
                disabled={Object.keys(validationErrors).length > 0}
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

          {/* 添加错误输入框的样式 */}
          <style dangerouslySetInnerHTML={{
            __html: `
              .error-input {
                border-color: #ff4d4f !important;
                box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2) !important;
              }
              
              .error-input:focus,
              .error-input:hover {
                border-color: #ff4d4f !important;
                box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2) !important;
              }
            `
          }} />
        </div>
      </div>
    </div>
  );
};

export default Login;