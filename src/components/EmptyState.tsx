import React from 'react';
import { Empty, Button } from 'antd';
import { UserOutlined, PictureOutlined, FileOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  icon?: 'user' | 'picture' | 'file' | React.ReactNode;
  message?: React.ReactNode;
  description?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  isEmpty?: boolean;
  children?: React.ReactNode;
}

/**
 * 通用空状态展示组件
 * 用于显示无数据、加载错误或需要用户操作的空状态
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'file',
  message = '暂无数据',
  description,
  actionText,
  onAction,
  isEmpty = true,
  children
}) => {
  // 如果提供了isEmpty属性且为false，显示children内容
  if (isEmpty === false && children) {
    return <>{children}</>;
  }
  
  // 根据icon类型渲染不同的图标
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    
    switch (icon) {
      case 'user':
        return <UserOutlined style={{ fontSize: 48 }} />;
      case 'picture':
        return <PictureOutlined style={{ fontSize: 48 }} />;
      default:
        return <FileOutlined style={{ fontSize: 48 }} />;
    }
  };

  return (
    <Empty
      image={renderIcon()}
      description={
        <div>
          <div className="empty-message">{message}</div>
          {description && <div className="empty-description">{description}</div>}
        </div>
      }
    >
      {actionText && onAction && (
        <Button type="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Empty>
  );
};

export default EmptyState;
