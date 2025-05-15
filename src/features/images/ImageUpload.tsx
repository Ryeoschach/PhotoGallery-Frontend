import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Input, Upload, Button, message, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { RcFile } from 'antd/es/upload';
import { uploadImage, getUploadStatus, resetUploadStatus, fetchGroups, selectAllGroups } from './imagesSlice';
import type { AppDispatch } from '../../app/store';

interface ImageUploadProps {
  visible: boolean;
  onClose: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const uploadStatus = useSelector(getUploadStatus);
  const groups = useSelector(selectAllGroups);

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (fileList.length === 0 || !fileList[0].originFileObj) {
        message.error('Please select an image to upload');
        return;
      }

      // 添加调试信息
      console.log("File object:", fileList[0].originFileObj);

      const uploadData = {
        name: values.name,
        description: values.description || '',
        image: fileList[0].originFileObj as File,
        groups: values.groups // 添加分组信息
      };

      await dispatch(uploadImage(uploadData)).unwrap();

      // 如果到达这里，说明上传成功了
      message.success('Image uploaded successfully');
      form.resetFields();
      setFileList([]);
      onClose();

    } catch (error: any) {
      console.error('Upload failed:', error);
      const errorMessage = 
        error.message || 
        (error.response?.data?.detail) || 
        (typeof error.response?.data === 'string' ? error.response.data : 'Unknown error');
      
      message.error(`Failed to upload image: ${errorMessage}`);
    }
  };

  // 关闭时重置状态
  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    dispatch(resetUploadStatus());
    onClose();
  };

  // 限制只能上传图片文件
  const beforeUpload = (file: RcFile) => {
    // 在控制台打印文件信息，以便调试
    console.log("Before upload file:", file);

    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
    }

    // 返回 false 阻止默认的上传行为，我们会在表单提交时手动上传
    return false;
  };

  // 处理文件列表变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 处理图片预览
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
  };

  // 将文件转换为 base64 格式
  const getBase64 = (file: RcFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <>
      <Modal
        title="Upload New Photo"
        open={visible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={uploadStatus === 'loading'} 
            onClick={handleSubmit}
          >
            Upload
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="image_upload_form"
          validateTrigger={['onChange', 'onBlur']}
        >
          <Form.Item
            name="name"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title for the image' }]}
          >
            <Input placeholder="Enter image title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Enter image description (optional)" rows={3} />
          </Form.Item>

          <Form.Item
            name="groups"
            label="Groups"
          >
            <Select
              mode="multiple"
              placeholder="Select groups (optional)"
              style={{ width: '100%' }}
            >
              {groups.map(group => (
                <Select.Option key={group.id} value={group.id} title={group.description}>
                  {group.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            label="Image" 
            required
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              maxCount={1} // 限制只能上传一张图片
              // 禁用默认的上传行为
              customRequest={({ onSuccess }) => {
                setTimeout(() => {
                  if (onSuccess) onSuccess("ok");
                }, 0);
              }}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={previewVisible} title="Preview" footer={null} onCancel={() => setPreviewVisible(false)}>
        <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default ImageUpload;