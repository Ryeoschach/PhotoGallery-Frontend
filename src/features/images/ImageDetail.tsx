import React, { useEffect, useState, useMemo } from 'react';
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
  Select,
  Tag,
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
  clearCurrentImage,
  fetchGroups,
  selectAllGroups,
  selectAllImages,
  getGroupsStatus,
  updateImageGroups
} from './imagesSlice';
import apiClient from '../../services/request';
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
  groups?: number[]; // 分组 ID 列表
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
  const { imageId } = useParams<{ imageId: string }>();
  const id = imageId; // 为保持代码一致性，保留id变量名
  
  const image = useSelector(selectImageDetail);
  const status = useSelector(getImageDetailStatus);
  const error = useSelector(getImageDetailError);
  
  // 如果当前图片对象不存在，尝试从已加载的图片列表中找到它
  const allImages = useSelector(selectAllImages);
  const imageFromList = useMemo(() => {
    if (!image && imageId && allImages.length > 0) {
      const imgId = parseInt(imageId);
      console.log('尝试从现有列表中查找图片ID:', imgId);
      return allImages.find(img => img.id === imgId);
    }
    return null;
  }, [image, imageId, allImages]);
  
  const groups = useSelector(selectAllGroups);
  const groupsStatus = useSelector(getGroupsStatus);
  
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // 记录组件状态的变化
  useEffect(() => {
    console.log('🖼️ ImageDetail组件状态变化:', { 
      id, 
      status, 
      error, 
      imageExists: !!image,
      imageData: image ? { 
        id: image.id, 
        name: image.name, 
        imageUrl: image.image 
      } : null
    });
  }, [id, status, error, image]);
  
  // 加载照片详情
  useEffect(() => {
    if (imageId) {
      console.log('🔄 开始获取图片详情，imageId:', imageId, '使用id变量:', id);
      dispatch(fetchImageDetail(parseInt(imageId)));
    } else {
      console.error('⚠️ 未找到图片ID参数');
    }
    
    return () => {
      console.log('🧹 清理组件，清除当前图片');
      dispatch(clearCurrentImage());
    };
  }, [imageId, id, dispatch]);
  
  // 加载分组数据
  useEffect(() => {
    if (groupsStatus === 'idle') {
      dispatch(fetchGroups());
    }
  }, [groupsStatus, dispatch]);
  
  // 返回
  const handleBack = () => {
    navigate('/');
  };
  
  // 开始编辑
  const startEditing = () => {
    if (image) {
      form.setFieldsValue({
        name: image.name, // 确认使用name字段
        description: image.description || '',
        groups: image.groups || [],
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
      console.log('Form values on save:', values);
      
      if (image) {
        // 注意这里修复了title字段的名称，应该是name
        await dispatch(updateImage({
          id: image.id,
          name: values.name || values.title, // 兼容两种可能的字段名
          description: values.description,
        })).unwrap();
        
        await dispatch(updateImageGroups({
          imageId: image.id,
          groupIds: values.groups,
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
  
  // 处理分组变更
  const handleGroupChange = async (selectedGroupIds: number[]) => {
    if (image) {
      try {
        await dispatch(updateImageGroups({
          imageId: image.id,
          groupIds: selectedGroupIds
        })).unwrap();
        
        message.success('照片分组已更新');
      } catch (error) {
        console.error('Failed to update image groups:', error);
        message.error('更新照片分组失败');
      }
    }
  };
  
  // 渲染分组信息
  const renderGroups = () => {
    if (!image) return null;
    
    if (isEditing) {
      return (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <Text strong>分组:</Text>
          </div>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="选择或创建分组"
            defaultValue={image.groups || []}
            onChange={handleGroupChange}
            loading={groupsStatus === 'loading'}
          >
            {groups.map(group => (
              <Select.Option key={group.id} value={group.id} title={group.description}>
                {group.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      );
    } else {
      return (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ marginRight: 8 }}>分组:</Text>
            {image.groups && image.groups.length > 0 ? (
              <div style={{ marginTop: 4 }}>
                {image.groups.map(groupId => {
                  const group = groups.find(g => g.id === groupId);
                  return group ? (
                    <Tag key={groupId} color="blue" style={{ marginBottom: 4 }}>
                      {group.name}
                    </Tag>
                  ) : null;
                })}
              </div>
            ) : (
              <Text type="secondary">未分组</Text>
            )}
          </div>
        </div>
      );
    }
  };
  
  // 加载中状态
  if (status === 'loading') {
    return (
      <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
          Back to Gallery
        </Button>
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Spin size="large" tip="Loading image...">
            <div style={{ padding: 50, background: 'rgba(0,0,0,0.05)', borderRadius: 4 }}>
              Loading image details...
            </div>
          </Spin>
        </div>
      </div>
    );
  }
  
  // 错误状态
  if (status === 'failed') {
    console.log('Error loading image detail:', error);
    return (
      <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
          Back to Gallery
        </Button>
        <Alert
          message="图片加载失败"
          description={`无法加载图片详情: ${error || '请检查网络连接或API服务'}`}
          type="error"
          showIcon
        />
        <div style={{ marginTop: 20 }}>
          <p>调试信息:</p>
          <div style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, marginBottom: 10 }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              图片ID: {id}<br/>
              请求URL: {apiClient.prefix}/images/{id}/<br/>
              错误信息: {error}<br/>
              请求状态: {status}<br/>
              时间: {new Date().toLocaleString()}
            </pre>
          </div>
          
          <p>可能的问题:</p>
          <ul>
            <li>图片ID不存在或已被删除</li>
            <li>API服务器返回了非JSON数据</li>
            <li>网络连接问题</li>
            <li>CORS策略限制</li>
          </ul>
          
          <p>解决方案:</p>
          <ul>
            <li>检查图片ID是否正确</li>
            <li>确认后端API服务正常运行</li>
            <li>检查浏览器控制台是否有错误信息</li>
          </ul>
          
          <div style={{ marginTop: 15 }}>
            <Button type="primary" onClick={() => window.location.reload()}>刷新页面</Button>
            <Button style={{ marginLeft: 10 }} onClick={handleBack}>返回首页</Button>
          </div>
        </div>
      </div>
    );
  }
  
  // 图片不存在，尝试使用列表中的图片作为备用
  if (!image) {
    // 如果从图片列表中找到了对应的图片，使用它
    if (imageFromList) {
      console.log('⚠️ 从fetchImageDetail获取失败，但从列表中找到图片:', imageFromList);
      return (
        <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
          <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
            返回图库
          </Button>
          <Alert
            message="从备用来源加载图片"
            description="无法从API获取图片详情，但从已缓存的列表中找到了该图片。"
            type="info"
            showIcon
          />
          
          {/* 显示图片内容 */}
          <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={16}>
              <div>
                <Image
                  src={imageFromList.image}
                  alt={imageFromList.name}
                  style={{ width: '100%', borderRadius: 8 }}
                  preview={{ 
                    mask: <div><EyeOutlined /> 全屏查看</div>
                  }}
                />
              </div>
            </Col>
            <Col xs={24} lg={8}>
              <Card>
                <Title level={3}>{imageFromList.name}</Title>
                {imageFromList.description ? (
                  <Text>{imageFromList.description}</Text>
                ) : (
                  <Text type="secondary">无描述</Text>
                )}
                <div style={{ marginTop: 16 }}>
                  <div>
                    <Text strong style={{ marginRight: 8 }}>上传时间:</Text>
                    <Text type="secondary">
                      {new Date(imageFromList.uploaded_at).toLocaleString()}
                    </Text>
                  </div>
                  
                  {/* 添加分组信息 */}
                  <div style={{ marginTop: 16 }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ marginRight: 8 }}>分组:</Text>
                      {imageFromList.groups && imageFromList.groups.length > 0 ? (
                        <div style={{ marginTop: 4 }}>
                          {imageFromList.groups.map(groupId => {
                            const group = groups.find(g => g.id === groupId);
                            return group ? (
                              <Tag key={groupId} color="blue" style={{ marginBottom: 4 }}>
                                {group.name}
                              </Tag>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <Text type="secondary">未分组</Text>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
          
          <div style={{ marginTop: 20, background: '#f5f5f5', padding: 10, borderRadius: 4 }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>调试信息:</p>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              图片ID: {id}<br/>
              API端点: {apiClient.prefix}/images/{id}/<br/>
              API请求状态: {status}<br/>
              从图片列表中找到: 是<br/>
              图片名称: {imageFromList.name}<br/>
              图片URL: {imageFromList.image}<br/>
              路由参数名称: imageId
            </pre>
          </div>
        </div>
      );
    }
  
    // 如果无法找到图片
    return (
      <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
          返回图库
        </Button>
        <Alert
          message="找不到图片"
          description="请求的图片不存在或可能已被删除。"
          type="warning"
          showIcon
        />
        <div style={{ marginTop: 20 }}>
          <p>可能的原因:</p>
          <ul>
            <li>图片ID不存在</li>
            <li>图片已被删除</li>
            <li>API服务器无法访问</li>
            <li>非JSON响应格式</li>
          </ul>
          
          <div style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, marginBottom: 10 }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>请求信息:</p>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              图片ID: {id}<br/>
              路由参数(imageId): {imageId}<br/>
              API端点: {apiClient.prefix}/images/{id}/<br/>
              状态: {status} (detailStatus: {status === 'succeeded' ? '成功但数据无效' : status})<br/>
              Redux Store中image是否存在: {image ? '是' : '否'}<br/>
              当前图片列表长度: {allImages.length}<br/>
              列表中是否存在该ID图片: {imageFromList ? '是' : '否'}
            </pre>
          </div>
          
          <Button type="primary" onClick={() => window.location.reload()}>刷新页面</Button>
        </div>
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
                  name: image.name, // 修改为name以匹配表单字段名
                  description: image.description || '',
                  groups: image.groups || [],
                }}
              >
                <Form.Item
                  name="name"
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
                
                <Form.Item
                  name="groups"
                  label="分组"
                >
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="选择分组"
                    onChange={handleGroupChange}
                    loading={groupsStatus === 'loading'}
                  >
                    {groups.map(group => (
                      <Select.Option key={group.id} value={group.id} title={group.description}>
                        {group.name}
                      </Select.Option>
                    ))}
                  </Select>
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
                    <Text>{image.width}px x {image.height}px</Text>
                  </div>

                  {/* 添加文件大小信息 */}
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ marginRight: 8 }}>文件大小:</Text>
                    <Text>{formatFileSize(image.size)}</Text>
                  </div>

                  {/* 原有的上传时间信息 */}
                  <div>
                    <Text strong style={{ marginRight: 8 }}>上传时间:</Text>
                    <Text type="secondary">
                      {new Date(image.uploaded_at).toLocaleString()}
                    </Text>
                  </div>
                </div>
                
                {/* 添加分组信息 */}
                {renderGroups()}
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ImageDetail;