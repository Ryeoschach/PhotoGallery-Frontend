import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Button, Spin, Select, Space, message, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { 
  fetchImages, 
  selectMyImages,
  selectImagesStatus, 
  selectImagesError,
  clearSelectedImages,
  selectSelectedImageIds,
  deleteImage,
  selectDeleteImageStatus,
  fetchGroups,
  selectAllGroups,
  setSelectedGroup
} from '../features/images/imagesSlice';
import ImageGrid from '../features/images/ImageGrid';
import ImageUploadForm from '../features/images/ImageUploadForm';
import type { AppDispatch } from '../app/store';

const { Title } = Typography;
const { Option } = Select;

const MyPhotosPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const images = useSelector(selectMyImages); // 使用选择器来过滤"我的照片"
  const selectedImageIds = useSelector(selectSelectedImageIds);
  const status = useSelector(selectImagesStatus);
  const error = useSelector(selectImagesError);
  const deleteStatus = useSelector(selectDeleteImageStatus);
  const groups = useSelector(selectAllGroups);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filterGroup, setFilterGroup] = useState<number | null>(null);

  useEffect(() => {
    // 获取当前用户自己的照片，传入 mine=true 参数
    dispatch(fetchImages({ mine: true }));
    dispatch(fetchGroups());
  }, [dispatch]);

  // 处理上传照片
  const handleOpenUploadModal = () => {
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    // 刷新照片列表，确保仍然只显示当前用户的照片
    dispatch(fetchImages({ mine: true }));
  };

  // 处理删除所选照片
  const handleDeleteSelected = () => {
    if (selectedImageIds.length === 0) {
      message.warning('请先选择要删除的照片');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedImageIds.length} 张照片吗？此操作不可撤销。`,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          // 逐个删除选中的照片
          const promises = selectedImageIds.map(id => dispatch(deleteImage(id)).unwrap());
          await Promise.all(promises);
          
          message.success('照片删除成功');
          dispatch(clearSelectedImages());
          // 刷新照片列表，确保仍然显示的是用户自己的照片
          dispatch(fetchImages({ mine: true }));
        } catch (err) {
          message.error('删除照片时出错');
          console.error('Delete error:', err);
        }
      },
    });
  };

  // 处理分组筛选
  const handleGroupFilterChange = (value: number | null) => {
    setFilterGroup(value);
    // 更新 Redux 中的分组过滤状态
    dispatch(setSelectedGroup(value));
  };

  // 渲染加载状态
  if (status === 'loading' && images.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  // 渲染错误状态
  if (status === 'failed') {
    return <div style={{ textAlign: 'center', padding: '50px' }}>
      <Typography.Text type="danger">{error || '加载照片失败'}</Typography.Text>
      <Button onClick={() => dispatch(fetchImages({ mine: true }))} style={{ marginTop: 16 }}>重试</Button>
    </div>;
  }

  // 调试输出 - 检查当前用户信息
  const currentUser = useSelector((state: any) => state.auth.user);
  console.log('当前用户信息:', currentUser);

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 20 
      }}>
        <Title level={2}>我的照片</Title>
        <Space>
          <Select
            style={{ width: 200 }}
            placeholder="按分组筛选"
            allowClear
            onChange={handleGroupFilterChange}
            value={filterGroup}
            popupRender={menu => (
              <>
                {menu}
                <div style={{ padding: '8px', textAlign: 'center' }}>
                  <Button 
                    type="link" 
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/groups')}
                  >
                    管理分组
                  </Button>
                </div>
              </>
            )}
          >
            {groups.map(group => (
              <Option key={group.id} value={group.id}>{group.name}</Option>
            ))}
          </Select>
          
          {selectedImageIds.length > 0 && (
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />}
              onClick={handleDeleteSelected}
              loading={deleteStatus === 'loading'}
            >
              删除所选 ({selectedImageIds.length})
            </Button>
          )}
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleOpenUploadModal}
          >
            上传照片
          </Button>
        </Space>
      </div>

      {/* 渲染 ImageGrid 组件，传递我们已经过滤的图片数据 */}
  <div style={{ marginBottom: 20 }}>
    {images.length > 0 ? (
      <ImageGrid selectionMode={true} filter="mine" />
    ) : (
      <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '8px' }}>
        <Typography.Text type="secondary" style={{ fontSize: '16px' }}>您还没有上传任何照片</Typography.Text>
        <div style={{ marginTop: '16px' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenUploadModal}>
            立即上传
          </Button>
        </div>
      </div>
    )}
  </div>
      
      <Modal
        title="上传照片"
        open={showUploadModal}
        onCancel={handleCloseUploadModal}
        footer={null}
        width={600}
      >
        <ImageUploadForm onSuccess={handleCloseUploadModal} />
      </Modal>
    </div>
  );
};

export default MyPhotosPage;