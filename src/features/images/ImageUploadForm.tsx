import React, { useState } from 'react';
import { Form, Input, Button, Upload, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useDispatch, useSelector } from 'react-redux';
import { 
  uploadImage, 
  selectUploadStatus,
  selectUploadError,
  resetUploadStatus,
  selectAllGroups
} from './imagesSlice';
import type { AppDispatch } from '../../app/store';

const { TextArea } = Input;
const { Option } = Select;

interface ImageUploadFormProps {
  onSuccess?: () => void;
}

const ImageUploadForm: React.FC<ImageUploadFormProps> = ({ onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const uploadStatus = useSelector(selectUploadStatus);
  const uploadError = useSelector(selectUploadError);
  const groups = useSelector(selectAllGroups);
  
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  
  // 表单提交处理
  const onFinish = async (values: any) => {
    if (fileList.length === 0) {
      message.error('请选择要上传的图片');
      return;
    }
    
    try {
      const uploadData = {
        name: values.name,
        description: values.description || '',
        image: fileList[0].originFileObj as File,
        groups: values.groups || []
      };
      
      await dispatch(uploadImage(uploadData)).unwrap();
      message.success('上传成功！');
      form.resetFields();
      setFileList([]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // 错误会在状态中处理
    }
  };
  
  // 上传配置
  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      // 检查文件类型
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
        return Upload.LIST_IGNORE;
      }
      
      // 检查文件大小 (小于 10MB)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('图片必须小于 10MB!');
        return Upload.LIST_IGNORE;
      }
      
      setFileList([file]);
      return false; // 阻止自动上传
    },
    maxCount: 1,
    fileList
  };
  
  // 重置表单
  const handleReset = () => {
    form.resetFields();
    setFileList([]);
    dispatch(resetUploadStatus());
  };
  
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        name="name"
        label="照片名称"
        rules={[{ required: true, message: '请输入照片名称' }]}
      >
        <Input placeholder="请输入照片名称" />
      </Form.Item>
      
      <Form.Item
        name="description"
        label="照片描述"
      >
        <TextArea placeholder="请输入照片描述（可选）" rows={3} />
      </Form.Item>
      
      <Form.Item
        name="groups"
        label="分组"
      >
        <Select
          mode="multiple"
          placeholder="选择分组（可选）"
          allowClear
          style={{ width: '100%' }}
        >
          {groups.map(group => (
            <Option key={group.id} value={group.id}>{group.name}</Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item
        label="选择图片"
        required
        tooltip="支持 jpg, png, gif 等常见图片格式，大小不超过 10MB"
      >
        <Upload
          {...uploadProps}
          listType="picture"
        >
          <Button icon={<UploadOutlined />} disabled={fileList.length >= 1}>
            选择图片
          </Button>
        </Upload>
      </Form.Item>
      
      {uploadError && (
        <div style={{ color: 'red', marginBottom: 16 }}>
          上传失败: {uploadError}
        </div>
      )}
      
      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={handleReset}>重置</Button>
          <Button 
            type="primary" 
            htmlType="submit"
            loading={uploadStatus === 'loading'}
            disabled={fileList.length === 0}
          >
            上传
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default ImageUploadForm;