/**
 * 错误消息组件
 * 用于显示友好的错误提示信息
 */

import React from 'react';
import { Alert, Button, Space } from 'antd';
import { CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import type { LoginError } from '../utils/errorHandling';
import { getErrorIcon, shouldShowRetryButton, getRetryAdvice } from '../utils/errorHandling';

interface ErrorMessageProps {
  error: LoginError | null;
  visible: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryText?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  visible,
  onRetry,
  onDismiss,
  retryText = '重试',
  className,
  style,
}) => {
  if (!visible || !error) return null;

  const showRetryButton = shouldShowRetryButton(error.type) && onRetry;
  const retryAdvice = getRetryAdvice(error.type);

  // 根据错误类型确定Alert的样式
  const getAlertType = () => {
    switch (error.type) {
      case 'validation':
        return 'warning' as const;
      case 'network':
        return 'error' as const;
      case 'authentication':
        return 'error' as const;
      case 'server':
        return 'warning' as const;
      default:
        return 'error' as const;
    }
  };

  // 构建完整的错误消息
  const errorIcon = getErrorIcon(error.type);
  const fullMessage = `${errorIcon} ${error.message}`;

  // Alert的action按钮
  const alertAction = (
    <Space>
      {showRetryButton && (
        <Button
          size="small"
          type="link"
          icon={<ReloadOutlined />}
          onClick={onRetry}
          style={{ padding: 0 }}
        >
          {retryText}
        </Button>
      )}
      {onDismiss && (
        <Button
          size="small"
          type="text"
          icon={<CloseOutlined />}
          onClick={onDismiss}
          style={{ padding: 0 }}
        />
      )}
    </Space>
  );

  return (
    <div 
      className={`error-message-container ${className || ''}`}
      style={{
        marginBottom: '16px',
        animation: 'fadeIn 0.3s ease-in-out',
        ...style
      }}
    >
      <Alert
        message={fullMessage}
        description={showRetryButton ? retryAdvice : undefined}
        type={getAlertType()}
        showIcon={false} // 我们使用自己的emoji图标
        action={alertAction}
        style={{
          borderRadius: '8px',
          border: `1px solid ${getAlertType() === 'warning' ? '#faad14' : '#ff4d4f'}`,
        }}
      />
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .error-message-container {
            animation: fadeIn 0.3s ease-in-out;
          }
        `
      }} />
    </div>
  );
};

export default ErrorMessage;
