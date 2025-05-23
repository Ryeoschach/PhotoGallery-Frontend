import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Button, 
  Modal, 
  Form, 
  Input, 
  message
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
import GroupSelect from '../../components/GroupSelect';
import ActionForm from '../../components/ActionForm';
import { showConfirmation } from '../../components/Confirmation';

const GroupSelector: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const groups = useSelector(selectAllGroups);
  const status = useSelector(getGroupsStatus);
  const groupError = useSelector((state: any) => state.images.groupsError);
  const selectedGroupId = useSelector(selectSelectedGroupId);
  
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  
  // 组件挂载时加载分组数据
  useEffect(() => {
    // 确保有登录令牌
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('没有找到认证令牌，可能无法执行需要认证的操作');
    }
    
    // 加载分组列表
    dispatch(fetchGroups());
  }, [dispatch]);
  
  // 处理分组过滤改变
  const handleGroupChange = (groupIds: number[]) => {
    // 我们的选择器可以支持多选，但当前逻辑只使用单选
    // 取第一个选中的分组ID，如果为空则设为null
    const groupId = groupIds.length > 0 ? groupIds[0] : null;
    console.log('GroupSelector: 分组选择变更为', groupId, '完整组ID列表:', groupIds);
    dispatch(setSelectedGroup(groupId));
  };
  
  // 打开创建分组的弹窗
  const showCreateGroupModal = () => {
    // 确保表单是空的
    createForm.resetFields();
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
  const handleCreateGroup = async (values: any) => {
    try {
      console.log('准备创建分组:', values);
      
      // 表单已经有验证规则，但再次确保所有必填字段都有值
      const groupData = {
        name: values.name ? values.name.trim() : '',
        description: values.description ? values.description.trim() : ''
      };
      
      if (!groupData.name) {
        message.error('分组名称不能为空');
        return;
      }
      
      const result = await dispatch(createGroup(groupData)).unwrap();
      console.log('创建分组成功:', result);
      
      message.success(`分组 "${groupData.name}" 创建成功`);
      setIsCreateModalVisible(false);
      createForm.resetFields();
      
      // 刷新分组列表
      dispatch(fetchGroups());
    } catch (error: any) {
      console.error('创建分组失败:', error);
      
      // 处理后端返回的验证错误
      if (error && typeof error === 'object') {
        // 处理字段验证错误
        if (error.name && Array.isArray(error.name)) {
          message.error(`分组名称错误: ${error.name[0]}`);
          return;
        }
        if (error.description && Array.isArray(error.description)) {
          message.error(`分组描述错误: ${error.description[0]}`);
          return;
        }
        if (error.detail) {
          message.error(`创建分组失败: ${error.detail}`);
          return;
        }
      }
      
      // 其他一般错误处理
      if (error === 'Authentication credentials were not provided.') {
        message.error('创建分组失败: 您需要先登录');
      } else if (typeof error === 'string') {
        message.error(`创建分组失败: ${error}`);
      } else if (error && error.message) {
        message.error(`创建分组失败: ${error.message}`);
      } else {
        message.error('创建分组失败，请稍后重试');
      }
    }
  };
  
  // 更新分组
  const handleUpdateGroup = async (values: any) => {
    if (!currentGroup) return;
    
    try {      
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
      message.success('分组删除成功');
      
      // 如果当前选中的分组被删除，则将选择器重置为null
      if (selectedGroupId === id) {
        dispatch(setSelectedGroup(null));
      }
    } catch (error) {
      console.error('Failed to delete group:', error);
      message.error('删除分组失败');
    }
  };
  
  // 确认删除分组
  const confirmDeleteGroup = (group: Group) => {
    showConfirmation({
      title: '删除分组',
      content: `确定要删除分组 "${group.name}" 吗？此操作不可撤销，但不会删除组内的照片。`,
      onConfirm: () => handleDeleteGroup(group.id),
      danger: true
    });
  };
  
  // 处理分组编辑
  const handleEditClick = (groupId: number) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      showEditGroupModal(group);
    }
  };
  
  // 处理分组删除
  const handleDeleteClick = (groupId: number) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      confirmDeleteGroup(group);
    }
  };
  
  // 将分组数据转换为组件需要的格式
  const groupOptions = groups.map(group => ({
    id: group.id,
    name: group.name,
    description: group.description || ''
  }));
  
  return (
    <div className="group-selector">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>按分组过滤</h3>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showCreateGroupModal}
        >
          创建分组
        </Button>
      </div>
      
      <div className="filter-container">
        <GroupSelect
          groups={groupOptions}
          value={selectedGroupId ? [selectedGroupId] : []}
          onChange={handleGroupChange}
          isLoading={status === 'loading'}
          placeholder="选择一个分组进行过滤"
          style={{ width: '30%' }}
          onActionClick={{
            edit: handleEditClick,
            delete: handleDeleteClick
          }}
          showActions={true}
          maxTagCount={1} // 最多显示1个标签
        />
        {groupError && (
          <div style={{ color: 'red', marginTop: 8 }}>
            {typeof groupError === 'string' ? groupError : '获取分组出错'}
          </div>
        )}
      </div>
      
      {/* 创建分组弹窗 */}
      <Modal
        title="创建新分组"
        open={isCreateModalVisible}
        onCancel={handleCreateCancel}
        footer={null}
      >
        <ActionForm
          form={createForm}
          onSubmit={handleCreateGroup}
          onCancel={handleCreateCancel}
          loading={status === 'loading'}
          submitText="创建"
        >
          <Form.Item
            name="name"
            label="分组名称"
            rules={[
              { required: true, message: '请输入分组名称' },
              { whitespace: true, message: '分组名称不能只包含空格' },
              { min: 1, max: 100, message: '分组名称长度需要在1-100个字符之间' }
            ]}
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
        </ActionForm>
      </Modal>
      
      {/* 编辑分组弹窗 */}
      <Modal
        title="编辑分组"
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
      >
        <ActionForm
          form={editForm}
          onSubmit={handleUpdateGroup}
          onCancel={handleEditCancel}
          loading={status === 'loading'}
          submitText="保存"
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
        </ActionForm>
      </Modal>
    </div>
  );
};

export default GroupSelector;