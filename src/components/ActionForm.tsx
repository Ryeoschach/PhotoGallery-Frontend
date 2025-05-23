import React from 'react';
import { Form, Button, Space } from 'antd';
import type { FormProps } from 'antd/lib/form';

interface ActionFormProps extends FormProps {
  onCancel?: () => void;
  onSubmit?: (values: any) => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
  showCancel?: boolean;
  children: React.ReactNode;
}

/**
 * 通用表单组件 - 提供一致的布局和操作按钮
 * 封装了表单的提交和取消功能，以及加载状态
 */
const ActionForm: React.FC<ActionFormProps> = ({
  onCancel,
  onSubmit,
  loading = false,
  submitText = '提交',
  cancelText = '取消',
  showCancel = true,
  children,
  ...formProps
}) => {
  const [form] = Form.useForm(formProps.form);

  const handleFinish = (values: any) => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleFinish}
      {...formProps}
    >
      {children}
      
      <Form.Item className="form-actions">
        <Space>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
          >
            {submitText}
          </Button>
          
          {showCancel && onCancel && (
            <Button onClick={onCancel} disabled={loading}>
              {cancelText}
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ActionForm;
