import React from 'react';
import { Input, Select, Space, Form, Button, Row, Col } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

const { Item } = Form;
const { Option } = Select;

export interface FilterOption {
  label: React.ReactNode;
  value: string | number;
}

interface FilterField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'custom';
  placeholder?: string;
  options?: FilterOption[];
  render?: (field: any) => React.ReactNode;
}

interface SearchFilterProps {
  fields: FilterField[];
  onSearch: (values: any) => void;
  loading?: boolean;
  initialValues?: Record<string, any>;
  compact?: boolean;
}

/**
 * 搜索过滤组件 - 提供通用的搜索和过滤功能
 * 支持多种字段类型和自定义渲染
 */
const SearchFilter: React.FC<SearchFilterProps> = ({
  fields,
  onSearch,
  loading = false,
  initialValues = {},
  compact = false
}) => {
  const [form] = Form.useForm();

  // 重置表单
  const handleReset = () => {
    form.resetFields();
    form.submit();
  };

  // 渲染字段
  const renderField = (field: FilterField) => {
    const { name, label, type, placeholder, options, render } = field;

    if (type === 'custom' && render) {
      return (
        <Item name={name} label={label} key={name}>
          {render(field)}
        </Item>
      );
    }

    if (type === 'select' && options) {
      return (
        <Item name={name} label={label} key={name}>
          <Select placeholder={placeholder || `请选择${label}`} allowClear>
            {options.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Item>
      );
    }

    return (
      <Item name={name} label={label} key={name}>
        <Input placeholder={placeholder || `请输入${label}`} allowClear />
      </Item>
    );
  };

  return (
    <Form
      form={form}
      layout={compact ? "inline" : "vertical"}
      onFinish={onSearch}
      initialValues={initialValues}
      className="search-filter-form"
    >
      <Row gutter={[16, 16]} align="middle">
        {fields.map(field => (
          <Col key={field.name} xs={24} sm={compact ? 'auto' : 12} md={compact ? 'auto' : 8} lg={compact ? 'auto' : 6}>
            {renderField(field)}
          </Col>
        ))}

        <Col xs={24} sm={compact ? 'auto' : 24} className="filter-actions">
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={loading}
            >
              搜索
            </Button>
            <Button
              onClick={handleReset}
              icon={<ClearOutlined />}
              disabled={loading}
            >
              重置
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );
};

export default SearchFilter;
