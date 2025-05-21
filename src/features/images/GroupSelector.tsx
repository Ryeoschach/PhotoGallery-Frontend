import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Select, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Divider, 
  Space, 
  message, 
  Popconfirm
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { 
  fetchGroups, 
  createGroup,
  updateGroup,
  deleteGroup,
  selectAllGroups, 
  getGroupsStatus,
  selectSelectedGroupId,
  setSelectedGroup
} from './imagesSlice';
import type { AppDispatch } from '../../app/store';
import type { Group } from './imagesSlice';

const { Option } = Select;

const GroupSelector: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const groups = useSelector(selectAllGroups);
  const status = useSelector(getGroupsStatus);
  const selectedGroupId = useSelector(selectSelectedGroupId);
  
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  
  // 组件挂载时加载分组数据
  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);
  
  // 处理分组过滤改变
  const handleGroupChange = (value: number | undefined) => {
    console.log('Group selected:', value);  // 调试日志
    // 将undefined转换为null，确保在取消选择时正确设置为null
    dispatch(setSelectedGroup(value === undefined ? null : value));
  };
  
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
  const handleDeleteGroup = async (id: number) => {
    try {
      await dispatch(deleteGroup(id)).unwrap();
      message.success('分组已删除');
      
      // 如果当前选中的分组被删除，则将选择器重置为null
      if (selectedGroupId === id) {
        dispatch(setSelectedGroup(null));
      }
    } catch (error) {
      console.error('Failed to delete group:', error);
      message.error('删除分组失败');
    }
  };
  
  // 自定义选项渲染
  const customOptionRender = (group: Group) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{group.name}</span>
      <Space>
        <Button
          type="text"
          icon={<EditOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            showEditGroupModal(group);
          }}
        />
        <Popconfirm
          title="确认删除该分组吗？"
          onConfirm={(e) => {
            e?.stopPropagation();
            handleDeleteGroup(group.id);
          }}
          onCancel={(e) => e?.stopPropagation()}
          okText="确认"
          cancelText="取消"
        >
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={(e) => e.stopPropagation()}
          />
        </Popconfirm>
      </Space>
    </div>
  );
  
  // 自定义下拉菜单渲染
  const popupRender = (menu: React.ReactElement) => (
    <div>
      {menu}
      <Divider style={{ margin: '4px 0' }} />
      <div style={{ padding: '8px', textAlign: 'center' }}>
        <Button type="text" icon={<PlusOutlined />} onClick={showCreateGroupModal}>
          创建新分组
        </Button>
      </div>
    </div>
  );
  
  return (
    <>
      <Select
        style={{ width: 250 }}
        placeholder="选择分组过滤"
        value={selectedGroupId === null ? undefined : selectedGroupId}
        onChange={handleGroupChange}
        allowClear
        loading={status === 'loading'}
        popupRender={popupRender}
        optionLabelProp="label"
      >
        {groups.map(group => (
          <Option 
            key={group.id} 
            value={group.id} 
            title={group.description}
            label={group.name}
          >
            {customOptionRender(group)}
          </Option>
        ))}
      </Select>
      
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
    </>
  );
};

export default GroupSelector;