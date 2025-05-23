import React from 'react';
import { Select, Tag, Space, Button } from 'antd';
import type { SelectProps } from 'antd/lib/select';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export interface GroupOption {
  id: number;
  name: string;
  description?: string | null;
}

interface GroupSelectorProps extends Omit<SelectProps, 'options'> {
  groups: GroupOption[];
  value?: number[] | null;
  onChange?: (groupIds: number[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  showDescription?: boolean;
  showActions?: boolean;
  onActionClick?: {
    edit?: (groupId: number) => void;
    delete?: (groupId: number) => void;
  };
}

/**
 * 分组选择器组件 - 用于选择图片分组
 * 支持多选和标签显示，以及编辑和删除操作
 */
const GroupSelect: React.FC<GroupSelectorProps> = ({
  groups,
  value,
  onChange,
  isLoading = false,
  placeholder = '选择分组',
  showDescription = true,
  showActions = false,
  onActionClick,
  ...selectProps
}) => {
  // 转换分组数据为Select选项
  const options = groups.map(group => {
    const label = (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span>{group.name}</span>
          {showDescription && group.description && (
            <span className="group-description"> - {group.description}</span>
          )}
        </div>
        
        {showActions && (
          <Space onClick={(e) => e.stopPropagation()}>
            {onActionClick?.edit && (
              <Button 
                type="text" 
                size="small" 
                icon={<EditOutlined />} 
                onClick={() => onActionClick.edit?.(group.id)}
              />
            )}
            {onActionClick?.delete && (
              <Button 
                type="text" 
                size="small" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => onActionClick.delete?.(group.id)}
              />
            )}
          </Space>
        )}
      </div>
    );
    
    return {
      label,
      value: group.id,
    };
  });

  // 自定义标签渲染
  const tagRender = (props: any) => {
    const { label, value, closable, onClose } = props;
    const group = groups.find(g => g.id === value);
    
    return (
      <Tag
        color="blue"
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {group?.name || label}
      </Tag>
    );
  };

  // 处理值变化
  const handleChange = (newValue: any) => {
    if (onChange) {
      // 确保返回数组，即使是单选情况
      const valueArray = Array.isArray(newValue) ? newValue : newValue ? [newValue] : [];
      console.log('GroupSelect handleChange:', { newValue, valueArray });
      onChange(valueArray);
    }
  };

  return (
    <Select
      mode="multiple"
      allowClear
      style={{ width: '100%' }}
      placeholder={placeholder}
      value={value || []}
      onChange={handleChange}
      options={options}
      loading={isLoading}
      tagRender={tagRender}
      {...selectProps}
    />
  );
};

export default GroupSelect;
