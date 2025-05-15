import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, 
  Image, 
  Typography, 
  Button, 
  Spin, 
  Alert, 
  Form, 
  Input,
  Row,
  Col,
  Popconfirm,
  message,
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SaveOutlined, 
  CloseOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { 
  fetchImageDetail, 
  selectImageDetail, 
  getImageDetailStatus, 
  getImageDetailError,
  updateImage,
  deleteImage,
  clearCurrentImage
} from './imagesSlice';
import type { AppDispatch } from '../../app/store';

// 在 types.ts 或相应的类型定义文件中
interface Image {
  id: number;
  name: string;
  description: string | null;
  image: string; // URL
  width: number;
  height: number;
  size?: number; // 文件大小（字节）
  uploaded_at: string; // ISO 日期字符串
  // ...其他属性
}

const { Title, Text } = Typography;
const { TextArea } = Input;

const formatFileSize = (bytes: number | undefined): string => {
  if (bytes === undefined) return '未知';
  
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
};

const ImageDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const image = useSelector(selectImageDetail);
  const status = useSelector(getImageDetailStatus);
  const error = useSelector(getImageDetailError);
  
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // 加载照片详情
useEffect(() => {
  if (id) {
    dispatch(fetchImageDetail(parseInt(id)));
  }
  
  return () => {
    dispatch(clearCurrentImage());
  };
}, [id, dispatch]);
  
  // 返回
  const handleBack = () => {
    navigate('/');
  };
  
  // 开始编辑
  const startEditing = () => {
    if (image) {
      form.setFieldsValue({
        name: image.name,
        description: image.description || '',
      });
      setIsEditing(true);
    }
  };
  
  // 取消编辑
  const cancelEditing = () => {
    setIsEditing(false);
  };
  
  // 保存编辑
  const saveEditing = async () => {
    try {
      const values = await form.validateFields();
      
      if (image) {
        await dispatch(updateImage({
          id: image.id,
          name: values.title,
          description: values.description,
        })).unwrap();
        
        message.success('Image updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };
  
  // 删除照片
  const handleDelete = async () => {
    if (image) {
      try {
        await dispatch(deleteImage(image.id)).unwrap();
        message.success('Image deleted successfully');
        navigate('/');
      } catch (error) {
        message.error('Failed to delete image');
      }
    }
  };
  
  // 图片加载完成时处理
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  // 加载中状态
if (status === 'loading') {
  return (
    <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
      <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
        Back to Gallery
      </Button>
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        {/* 方法1：使用嵌套模式 */}
        <Spin size="large" tip="Loading image...">
          <div style={{ padding: 50, background: 'rgba(0,0,0,0.05)', borderRadius: 4 }}>
            Loading image details...
          </div>
        </Spin>
        
        {/* 或者方法2：分开显示 Spin 和文本 */}
        {/* 
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading image...</p>
        */}
      </div>
    </div>
  );
}
  
  // 错误状态
  if (status === 'failed') {
    return (
      <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
          Back to Gallery
        </Button>
        <Alert
          message="Error"
          description={`Failed to load image: ${error}`}
          type="error"
          showIcon
        />
      </div>
    );
  }
  
  // 图片不存在
  if (!image) {
    return (
      <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
          Back to Gallery
        </Button>
        <Alert
          message="Image not found"
          description="The requested image does not exist or has been deleted."
          type="warning"
          showIcon
        />
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Back to Gallery
        </Button>
        
        <div>
          {isEditing ? (
            <>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={saveEditing} 
                style={{ marginRight: 8 }}
              >
                Save
              </Button>
              <Button icon={<CloseOutlined />} onClick={cancelEditing}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={startEditing} 
                style={{ marginRight: 8 }}
              >
                Edit
              </Button>
              <Popconfirm
                title="Delete this image"
                description="Are you sure you want to delete this image?"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
            </>
          )}
        </div>
      </div>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {!imageLoaded && <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>}
          <div style={{ display: imageLoaded ? 'block' : 'none' }}>
            <Image
              src={image.image}
              alt={image.name}
              style={{ width: '100%', borderRadius: 8 }}
              onLoad={handleImageLoad}
              preview={{ 
                mask: <div>
                  <EyeOutlined /> View fullscreen
                </div>
              }}
            />
          </div>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card>
            {isEditing ? (
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  title: image.name,
                  description: image.description || '',
                }}
              >
                <Form.Item
                  name="title"
                  label="Title"
                  rules={[{ required: true, message: 'Please enter a title' }]}
                >
                  <Input />
                </Form.Item>
                
                <Form.Item
                  name="description"
                  label="Description"
                >
                  <TextArea rows={4} />
                </Form.Item>
              </Form>
            ) : (
              <>
                <Title level={3}>{image.name}</Title>
                
                {image.description ? (
                  <Text>{image.description}</Text>
                ) : (
                  <Text type="secondary">No description</Text>
                )}
                
                <div style={{ marginTop: 16 }}>
                  {/* 添加图片尺寸信息 */}
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ marginRight: 8 }}>尺寸:</Text>
                    {/* 使用后端返回的宽度和高度 */}
                    <Text>{image.width}px × {image.height}px</Text>
                  </div>

                  {/* 添加文件大小信息 */}
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ marginRight: 8 }}>文件大小:</Text>
                    <Text>
                      {/* 将字节大小转换为更友好的格式 */}
                      {formatFileSize(image.size)}
                    </Text>
                  </div>

                  {/* 原有的上传时间信息 */}
                  <div>
                    <Text strong style={{ marginRight: 8 }}>上传时间:</Text>
                    <Text type="secondary">
                      {new Date(image.uploaded_at).toLocaleString()}
                    </Text>
                  </div>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ImageDetail;