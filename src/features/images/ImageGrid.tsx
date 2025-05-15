import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Image, 
  Button, 
  Checkbox, 
  Row, 
  Col, 
  Spin, 
  Alert,
  Popconfirm,
  message,
  Modal,
  Form,
  Input
} from 'antd';
import { PlusOutlined, DeleteOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { 
  fetchImages, 
  selectFilteredImages,
  getImagesStatus, 
  getImagesError,
  toggleImageSelection,
  clearSelectedImages,
  selectAllImagesAction,
  bulkDeleteImages,
  getSelectedImageIds,
  createGroup
} from './imagesSlice';
import type { Image as ImageType } from './imagesSlice';
import type { AppDispatch } from '../../app/store';
import ImageUpload from './ImageUpload';
import GroupSelector from './GroupSelector';

const { Meta } = Card;

const ImageGrid: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const images = useSelector(selectFilteredImages);
  const status = useSelector(getImagesStatus);
  const error = useSelector(getImagesError);
  const selectedImageIds = useSelector(getSelectedImageIds);
  
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchImages());
    }
  }, [status, dispatch]);
  
  const handleImageClick = (id: number) => {
    if (selectionMode) {
      dispatch(toggleImageSelection(id));
    } else {
      navigate(`/images/${id}`);
    }
  };
  
  const enterSelectionMode = () => {
    setSelectionMode(true);
  };
  
  const exitSelectionMode = () => {
    setSelectionMode(false);
    dispatch(clearSelectedImages());
  };
  
  const handleBulkDelete = async () => {
    if (selectedImageIds.length === 0) return;
    
    try {
      await dispatch(bulkDeleteImages(selectedImageIds)).unwrap();
      message.success(`成功删除 ${selectedImageIds.length} 张照片`);
      exitSelectionMode();
    } catch (error) {
      message.error('批量删除失败');
    }
  };
  
  const handleCreateGroup = async () => {
    try {
      const values = await form.validateFields();
      
      await dispatch(createGroup({
        name: values.name,
        description: values.description || ''
      })).unwrap();
      
      message.success(`分组 "${values.name}" 创建成功`);
      setCreateGroupModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to create group:', error);
      message.error('创建分组失败');
    }
  };
  
  const renderToolbar = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <GroupSelector />
        <Button 
          icon={<AppstoreAddOutlined />} 
          onClick={() => setCreateGroupModalVisible(true)} 
          style={{ marginLeft: 8 }}
        >
          创建分组
        </Button>
      </div>
      
      <div>
        {selectionMode ? (
          <>
            <Checkbox 
              onChange={(e) => {
                if (e.target.checked) {
                  dispatch(selectAllImagesAction());
                } else {
                  dispatch(clearSelectedImages());
                }
              }} 
              checked={selectedImageIds.length > 0 && selectedImageIds.length === images.length}
              indeterminate={selectedImageIds.length > 0 && selectedImageIds.length < images.length}
              style={{ marginRight: 8 }}
            >
              全选
            </Checkbox>
            <Popconfirm
              title="删除选中的照片"
              description={`确定要删除选中的 ${selectedImageIds.length} 张照片吗？`}
              onConfirm={handleBulkDelete}
              okText="确定"
              cancelText="取消"
              disabled={selectedImageIds.length === 0}
            >
              <Button 
                type="primary" 
                danger 
                icon={<DeleteOutlined />}
                disabled={selectedImageIds.length === 0}
                style={{ marginRight: 8 }}
              >
                删除选中 ({selectedImageIds.length})
              </Button>
            </Popconfirm>
            <Button onClick={exitSelectionMode}>取消选择</Button>
          </>
        ) : (
          <>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setUploadModalVisible(true)}
              style={{ marginRight: 8 }}
            >
              上传照片
            </Button>
            <Button onClick={enterSelectionMode}>选择照片</Button>
          </>
        )}
      </div>
    </div>
  );
  
  const renderImageGrid = () => (
    <Row gutter={[16, 16]}>
      {images.map((image: ImageType) => (
        <Col xs={24} sm={12} md={8} lg={6} key={image.id}>
          <div 
            style={{ 
              position: 'relative', 
              cursor: selectionMode ? 'pointer' : 'pointer'
            }}
            onClick={() => handleImageClick(image.id)}
          >
            <Card
              hoverable
              cover={
                <div 
                  style={{ 
                    height: 200, 
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f0f0f0'
                  }}
                >
                  <Image
                    alt={image.name}
                    src={image.image}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    preview={selectionMode ? false : true}
                  />
                </div>
              }
            >
              <Meta 
                title={image.name} 
                description={
                  image.description ? 
                    (image.description.length > 50 ? 
                      `${image.description.substring(0, 50)}...` : 
                      image.description) : 
                    '暂无描述'
                } 
              />
            </Card>
            
            {selectionMode && (
              <Checkbox
                checked={selectedImageIds.includes(image.id)}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(255, 255, 255, 0.8)',
                  padding: 4,
                  borderRadius: 4
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(toggleImageSelection(image.id));
                }}
              />
            )}
          </div>
        </Col>
      ))}
    </Row>
  );
  
  if (status === 'loading' && images.length === 0) {
    return (
      <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
        {renderToolbar()}
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>加载照片中...</p>
        </div>
      </div>
    );
  }
  
  if (status === 'failed') {
    return (
      <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
        {renderToolbar()}
        <Alert
          message="错误"
          description={`加载照片失败: ${error}`}
          type="error"
          showIcon
        />
      </div>
    );
  }
  
  if (images.length === 0) {
    return (
      <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
        {renderToolbar()}
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <div style={{ fontSize: 64, color: '#cccccc' }}>
            <PlusOutlined />
          </div>
          <p style={{ marginTop: 16, color: '#999999' }}>
            {status === 'succeeded' ? '没有照片，点击"上传照片"添加' : '加载照片中...'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
      {renderToolbar()}
      {renderImageGrid()}
      
      <ImageUpload 
        visible={uploadModalVisible} 
        onClose={() => setUploadModalVisible(false)} 
      />
      
      <Modal
        title="创建新分组"
        open={createGroupModalVisible}
        onOk={handleCreateGroup}
        onCancel={() => {
          setCreateGroupModalVisible(false);
          form.resetFields();
        }}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          name="create_group_form"
        >
          <Form.Item
            name="name"
            label="分组名称"
            rules={[{ required: true, message: '请输入分组名称' }]}
          >
            <Input placeholder="例如：风景、人物、动物等" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea 
              placeholder="分组的简要描述（可选）" 
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ImageGrid;