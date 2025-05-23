import React from 'react';
import { Alert, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingStateProps {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string | null;
  loadingMessage?: string;
  errorMessage?: string;
  children: React.ReactNode;
}

/**
 * 处理加载状态的通用组件
 * 根据当前加载状态显示相应的UI (加载中、错误、内容)
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  status,
  error,
  loadingMessage = '加载中...',
  errorMessage = '加载失败',
  children
}) => {
  // 自定义加载图标
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (status === 'loading') {
    return (
      <div className="loading-container" data-testid="loading-spinner">
        <Spin indicator={antIcon} tip={loadingMessage} />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <Alert
        message={errorMessage}
        description={error || '请稍后重试'}
        type="error"
        showIcon
      />
    );
  }

  return <>{children}</>;
};

export default LoadingState;
