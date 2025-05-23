import React, { useState } from 'react';
import { Upload, message, Form } from 'antd';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload';

interface ImageUploadProps {
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  maxCount?: number;
  listType?: 'text' | 'picture' | 'picture-card';
  dragable?: boolean;
  maxSize?: number; // 单位：MB
  acceptedTypes?: string[];
}

/**
 * 图片上传组件 - 用于表单中的图片上传
 * 支持拖放上传和文件列表显示
 */
const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  maxCount = 1,
  listType = 'picture-card',
  dragable = false,
  maxSize = 5, // 默认5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>(value || []);
  
  // 文件大小检查
  const checkFileSize = (file: RcFile): boolean => {
    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      message.error(`文件大小必须小于 ${maxSize}MB!`);
      return false;
    }
    return true;
  };
  
  // 文件类型检查
  const checkFileType = (file: RcFile): boolean => {
    if (acceptedTypes && acceptedTypes.length > 0) {
      const isAccepted = acceptedTypes.includes(file.type);
      if (!isAccepted) {
        message.error(`只支持上传 ${acceptedTypes.join(', ')} 格式的文件!`);
        return false;
      }
    }
    return true;
  };
  
  // 上传前检查
  const beforeUpload = (file: RcFile): boolean => {
    const isValidSize = checkFileSize(file);
    const isValidType = checkFileType(file);
    return isValidSize && isValidType;
  };
  
  // 处理文件变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (onChange) {
      onChange(newFileList);
    }
  };
  
  // 上传按钮
  const uploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>点击上传</div>
    </div>
  );
  
  // 拖拽上传区域
  const dragProps = {
    name: 'file',
    multiple: maxCount > 1,
    fileList,
    beforeUpload,
    onChange: handleChange,
    accept: acceptedTypes.join(','),
    maxCount,
    listType,
    customRequest: ({ onSuccess }: any) => {
      // 防止自动发送请求，由表单统一处理
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    }
  };
  
  return (
    <Form.Item>
      {dragable ? (
        <Upload.Dragger {...dragProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个或批量上传。严禁上传公司数据或其他违禁文件。
          </p>
        </Upload.Dragger>
      ) : (
        <Upload {...dragProps}>
          {fileList.length >= maxCount ? null : uploadButton}
        </Upload>
      )}
    </Form.Item>
  );
};

export default ImageUpload;
