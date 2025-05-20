import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Typography, 
  Table, 
  Space, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Popconfirm,
  message
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
  fetchGroups, 
  createGroup, 
  updateGroup, 
  deleteGroup,
  selectAllGroups, 
  getGroupsStatus
} from '../features/images/imagesSlice';
import type { AppDispatch } from '../app/store';
import type { Group } from '../features/images/imagesSlice';

const { Title } = Typography;

const GroupsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const groups = useSelector(selectAllGroups);
  const status = useSelector(getGroupsStatus);
  
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  
  // 组件挂载时加载分组数据
  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);
  
  // 打开创建分组的弹窗
  const showCreateGroupModal = () => {
    setIsCreateModalVisible(true);
  };
  
  // 打开编辑分组的弹窗
  const showEditGroupModal = (group: Group) => {
    setCurrentGroup(group);
    editForm.setFieldsValue({
      name: group.name,
      description: group.description || ''
    });
    setIsEditModalVisible(true);
  };
  
  // 取消创建分组
  const handleCreateCancel = () => {
    setIsCreateModalVisible(false);
    createForm.resetFields();
  };
  
  // 取消编辑分组
  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setCurrentGroup(null);
    editForm.resetFields();
  };
  
  // 创建分组
  const handleCreateGroup = async () => {
    try {
      const values = await createForm.validateFields();
      
      await dispatch(createGroup({
        name: values.name,
        description: values.description || ''
      })).unwrap();
      
      message.success(`分组 "${values.name}" 创建成功`);
      setIsCreateModalVisible(false);
      createForm.resetFields();
    } catch (error) {
      console.error('Failed to create group:', error);
      message.error('创建分组失败');
    }
  };
  
  // 更新分组
  const handleUpdateGroup = async () => {
    try {
      if (!currentGroup) return;
      
      const values = await editForm.validateFields();
      
      await dispatch(updateGroup({
        id: currentGroup.id,
        name: values.name,
        description: values.description || ''
      })).unwrap();
      
      message.success(`分组 "${values.name}" 更新成功`);
      setIsEditModalVisible(false);
      setCurrentGroup(null);
      editForm.resetFields();
    } catch (error) {
      console.error('Failed to update group:', error);
      message.error('更新分组失败');
    }
  };
  
  // 删除分组
  const handleDeleteGroup = async (groupId: number) => {
    try {
      await dispatch(deleteGroup(groupId)).unwrap();
      message.success('分组删除成功');
    } catch (error) {
      console.error('Failed to delete group:', error);
      message.error('删除分组失败');
    }
  };
  
  // 表格列配置
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string | null) => <span>{text || '无描述'}</span>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Group) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => showEditGroupModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除分组"
            description="确定要删除这个分组吗？这不会删除分组中的照片。"
            onConfirm={() => handleDeleteGroup(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 20 
      }}>
        <Title level={2}>分组管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showCreateGroupModal}
        >
          创建分组
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={groups.map(group => ({...group, key: group.id}))} 
        loading={status === 'loading'} 
        pagination={false}
        rowKey="id"
      />
      
      {/* 创建分组的弹窗 */}
      <Modal
        title="创建新分组"
        open={isCreateModalVisible}
        onOk={handleCreateGroup}
        onCancel={handleCreateCancel}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={createForm}
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
      
      {/* 编辑分组的弹窗 */}
      <Modal
        title="编辑分组"
        open={isEditModalVisible}
        onOk={handleUpdateGroup}
        onCancel={handleEditCancel}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={editForm}
          layout="vertical"
          name="edit_group_form"
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

export default GroupsPage;
