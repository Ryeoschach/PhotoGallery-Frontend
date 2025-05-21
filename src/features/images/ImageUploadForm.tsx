import React, { useState } from 'react';
import { Form, Input, Button, Upload, message, Select } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useDispatch, useSelector } from 'react-redux';
import { 
  uploadImage, 
  selectUploadStatus,
  selectUploadError,
  resetUploadStatus,
  selectAllGroups,
  fetchImages
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
  const handleSubmit = async () => {
    try {
      if (fileList.length === 0) {
        message.error('请选择要上传的图片');
        return;
      }

      // 确保文件对象存在且有效
      const file = fileList[0];
      if (!file) {
        message.error('没有找到有效的文件对象');
        return;
      }

      // 使用原始文件对象，更安全的获取方式
      const fileObj = file.originFileObj || file;
      if (!fileObj || !(fileObj instanceof File)) {
        console.error('文件对象无效:', fileObj);
        message.error('文件对象无效，请重新选择文件');
        return;
      }

      console.log('上传前文件对象信息:', {
        name: fileObj.name,
        type: fileObj.type,
        size: fileObj.size,
        lastModified: new Date(fileObj.lastModified).toISOString()
      });

      const values = await form.validateFields();
      const uploadData = {
        name: values.name,
        description: values.description || '',
        image: fileObj,
        groups: values.groups || []
      };
      
      // 上传照片
      await dispatch(uploadImage(uploadData)).unwrap();
      message.success('上传成功！');
      form.resetFields();
      setFileList([]);
      
      // 上传成功后，直接获取最新照片列表
      console.log('照片上传成功，正在获取最新照片列表');
      await dispatch(fetchImages({ mine: true }));
      
      // 最后再调用 onSuccess 回调关闭模态框
      if (onSuccess) onSuccess();
    } catch (err) {
      // 错误会在状态中处理
      console.error('上传照片时发生错误:', err);
      message.error(err instanceof Error ? `上传失败: ${err.message}` : '上传失败，请重试');
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
      
      // 创建一个带有originFileObj属性的UploadFile对象
      const uploadFile: UploadFile = {
        uid: file.uid || `-${Date.now()}`, // 如果没有uid，生成一个临时的
        name: file.name,
        status: 'done',
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        percent: 100,
        originFileObj: file, // 确保原始文件对象被保存
      };
      
      setFileList([uploadFile]);
      console.log('文件已添加到上传列表:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hasOriginFileObj: !!uploadFile.originFileObj
      });
      
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
      onFinish={handleSubmit}
      className="modern-form"
    >
      <Form.Item
        name="name"
        label="照片名称"
        rules={[{ required: true, message: '请输入照片名称' }]}
      >
        <Input placeholder="请输入照片名称" className="modern-input" />
      </Form.Item>
      
      <Form.Item
        name="description"
        label="照片描述"
      >
        <TextArea 
          placeholder="请输入照片描述（可选）" 
          rows={3} 
          className="modern-textarea"
        />
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
          className="modern-select"
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
        <div className="upload-container">
          {fileList.length === 0 ? (
            <Upload
              {...uploadProps}
              listType="picture-card"
              className="modern-upload"
              customRequest={({ onSuccess }) => {
                if (onSuccess) {
                  setTimeout(() => {
                    onSuccess({}, new XMLHttpRequest());
                  }, 0);
                }
              }}
            >
              <div className="upload-placeholder">
                <PictureOutlined style={{ fontSize: 32, color: 'var(--primary-color)' }} />
                <p>点击上传图片</p>
              </div>
            </Upload>
          ) : (
            <div className="selected-file-preview">
              <div className="preview-image">
                {fileList[0].type?.startsWith('image/') && fileList[0].originFileObj && (
                  <img 
                    src={URL.createObjectURL(fileList[0].originFileObj)} 
                    alt="Preview" 
                    style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }} 
                  />
                )}
              </div>
              <div className="file-info">
                <div className="file-name">{fileList[0].name}</div>
                <div className="file-size">{(fileList[0].size! / 1024).toFixed(1)} KB</div>
                <Button 
                  type="text" 
                  danger 
                  onClick={() => setFileList([])}
                  style={{ padding: 0 }}
                >
                  移除
                </Button>
              </div>
            </div>
          )}
        </div>
      </Form.Item>
      
      {uploadError && (
        <div className="error-message">
          上传失败: {uploadError}
        </div>
      )}
      
      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
          <Button onClick={handleReset}>
            重置
          </Button>
          <Button 
            type="primary" 
            htmlType="submit"
            loading={uploadStatus === 'loading'}
            disabled={fileList.length === 0}
            className={fileList.length > 0 ? "modern-button-primary" : ""}
          >
            上传
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default ImageUploadForm;