import React from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import type { ButtonProps } from 'antd/es/button'; // 导入正确的ButtonProps类型

interface ConfirmationProps {
  title?: string;
  content: React.ReactNode;
  okText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  danger?: boolean;
}

/**
 * 通用确认对话框 - 静态方法
 * 用于需要用户确认的操作，如删除
 */
export const showConfirmation = ({
  title = '确认操作',
  content,
  okText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  danger = false
}: ConfirmationProps) => {
  Modal.confirm({
    title,
    icon: <ExclamationCircleFilled />,
    content,
    okText,
    cancelText,
    onOk: onConfirm,
    onCancel,
    okButtonProps: {
      danger,
    },
  });
};

interface ConfirmButtonProps {
  title?: string;
  content: React.ReactNode;
  okText?: string;
  cancelText?: string;
  onConfirm: () => void;
  loading?: boolean;
  buttonText: string;
  danger?: boolean;
  buttonProps?: ButtonProps; // 使用antd的ButtonProps类型
}

/**
 * 确认按钮组件 - 点击后显示确认对话框
 */
export const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  title,
  content,
  okText,
  cancelText,
  onConfirm,
  loading = false,
  buttonText,
  danger = false,
  buttonProps
}) => {
  const handleClick = () => {
    showConfirmation({
      title,
      content,
      okText,
      cancelText,
      onConfirm,
      danger
    });
  };

  return (
    <Button
      danger={danger}
      onClick={handleClick}
      loading={loading}
      {...buttonProps}
    >
      {buttonText}
    </Button>
  );
};
