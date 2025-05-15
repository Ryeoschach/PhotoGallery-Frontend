import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Image, 
  Typography, 
  Button, 
  Checkbox, 
  Row, 
  Col, 
  Spin, 
  Alert,
  Popconfirm,
  message
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
  fetchImages, 
  selectAllImages,  // selector 函数 - 用于获取所有图片
  getImagesStatus, 
  getImagesError,
  toggleImageSelection,
  clearSelectedImages,
  selectAllImagesAction,  // action creator - 用于选择所有图片的 action
  bulkDeleteImages,
  getSelectedImageIds
} from './imagesSlice';
import type { Image as ImageType } from './imagesSlice';
import type { AppDispatch } from '../../app/store';
import ImageUpload from './ImageUpload';

const { Meta } = Card;
const { Title } = Typography;

const ImageGrid: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const images = useSelector(selectAllImages);
  const status = useSelector(getImagesStatus);
  const error = useSelector(getImagesError);
  const selectedImageIds = useSelector(getSelectedImageIds);
  
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  
  // 加载照片
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchImages());
    }
  }, [status, dispatch]);
  
  // 处理点击照片
  const handleImageClick = (id: number) => {
    if (selectionMode) {
      dispatch(toggleImageSelection(id));
    } else {
      navigate(`/images/${id}`);
    }
  };
  
  // 处理批量删除
  const handleBulkDelete = async () => {
    if (selectedImageIds.length === 0) {
      message.warning('No images selected');
      return;
    }
    
    try {
      await dispatch(bulkDeleteImages(selectedImageIds)).unwrap();
      message.success(`Successfully deleted ${selectedImageIds.length} images`);
      dispatch(clearSelectedImages());
      setSelectionMode(false);
    } catch (error) {
      message.error('Failed to delete some images');
    }
  };
  
  // 进入选择模式
  const enterSelectionMode = () => {
    setSelectionMode(true);
  };
  
  // 退出选择模式
  const exitSelectionMode = () => {
    setSelectionMode(false);
    dispatch(clearSelectedImages());
  };
  
  // 全选/取消全选
  const handleSelectAll = (e: any) => {
    if (e.target.checked) {
      dispatch(selectAllImagesAction());  // 使用正确的 action creator 名称
    } else {
      dispatch(clearSelectedImages());
    }
  };
  
  // 检查图片是否被选中
  const isImageSelected = (id: number) => {
    return selectedImageIds.includes(id);
  };
  
  // 渲染工具栏
  const renderToolbar = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <Title level={2} style={{ margin: 0 }}>Photo Gallery</Title>
      
      <div>
        {selectionMode ? (
          <>
            <Checkbox 
              onChange={handleSelectAll} 
              checked={selectedImageIds.length > 0 && selectedImageIds.length === images.length}
              indeterminate={selectedImageIds.length > 0 && selectedImageIds.length < images.length}
              style={{ marginRight: 8 }}
            >
              Select All
            </Checkbox>
            <Popconfirm
              title="Delete selected images"
              description={`Are you sure you want to delete ${selectedImageIds.length} selected images?`}
              onConfirm={handleBulkDelete}
              okText="Yes"
              cancelText="No"
              disabled={selectedImageIds.length === 0}
            >
              <Button 
                type="primary" 
                danger 
                icon={<DeleteOutlined />}
                disabled={selectedImageIds.length === 0}
                style={{ marginRight: 8 }}
              >
                Delete Selected ({selectedImageIds.length})
              </Button>
            </Popconfirm>
            <Button onClick={exitSelectionMode}>Cancel</Button>
          </>
        ) : (
          <>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setUploadModalVisible(true)}
              style={{ marginRight: 8 }}
            >
              Upload Photo
            </Button>
            <Button onClick={enterSelectionMode}>Select Images</Button>
          </>
        )}
      </div>
    </div>
  );
  
  // 加载中状态
  // 修改加载中状态部分
if (status === 'loading' && images.length === 0) {
  return (
    <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
      {renderToolbar()}
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading images...</p>
      </div>
    </div>
  );
}
  
  // 错误状态
  if (status === 'failed') {
    return (
      <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
        {renderToolbar()}
        <Alert
          message="Error"
          description={`Failed to load images: ${error}`}
          type="error"
          showIcon
        />
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%', minWidth: '320px', maxWidth: '1280px' }}>
      {renderToolbar()}
      
      {images.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <p>No images found. Click "Upload Photo" to add some!</p>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {images.map((image: ImageType) => (
            <Col xs={24} sm={12} md={8} lg={6} key={image.id}>
              <Card
                hoverable
                cover={
                  <div style={{ position: 'relative', overflow: 'hidden', height: 200 }}>
                    <Image
                      alt={image.name}
                      src={image.image}
                      style={{ 
                        objectFit: 'cover',
                        height: '100%', 
                        width: '100%'
                      }}
                      preview={false}
                      onClick={() => handleImageClick(image.id)}
                    />
                    {selectionMode && (
                      <Checkbox
                        checked={isImageSelected(image.id)}
                        onChange={() => dispatch(toggleImageSelection(image.id))}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(255, 255, 255, 0.7)',
                          borderRadius: '50%',
                          padding: 4
                        }}
                      />
                    )}
                  </div>
                }
                style={{
                  ...(selectionMode && isImageSelected(image.id) ? { 
                    border: '2px solid #1890ff',
                    boxShadow: '0 0 10px rgba(24, 144, 255, 0.3)' 
                  } : {})
                }}
              >
                <Meta
                  title={image.name}
                //   description={image.description?.length > 50 
                //     ? `${image.description.substring(0, 50)}...` 
                //     : image.description || 'No description'
                //   }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
      <ImageUpload 
        visible={uploadModalVisible} 
        onClose={() => setUploadModalVisible(false)}
      />
    </div>
  );
};

export default ImageGrid;