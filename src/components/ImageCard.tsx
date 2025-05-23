import React, { useState } from 'react';
import { Image as AntImage, Card, Typography } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Meta } = Card;
const { Paragraph } = Typography;

interface ImageProps {
  id: number;
  name: string;
  description?: string | null;
  imageUrl: string;
  thumbnailUrl?: string;
  selected?: boolean;
  onSelect?: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
  showActions?: boolean;
  clickable?: boolean;
}

/**
 * 通用图片卡片组件
 * 显示单张图片的卡片，支持选择、查看、编辑和删除操作
 */
const ImageCard: React.FC<ImageProps> = ({
  id,
  name,
  description,
  imageUrl,
  thumbnailUrl,
  selected = false,
  onSelect,
  onDelete,
  onEdit,
  showActions = true,
  clickable = true
}) => {
  const [loading, setLoading] = useState(true);

  // 图片加载完成时的处理函数
  const handleImageLoaded = () => {
    setLoading(false);
  };

  // 卡片操作按钮
  const actions = showActions ? [
    <Link to={`/images/${id}`} key="view">
      <EyeOutlined /> 查看
    </Link>
  ] : [];

  // 如果提供了编辑函数，添加编辑按钮
  if (showActions && onEdit) {
    actions.push(
      <span key="edit" onClick={() => onEdit(id)}>
        <EditOutlined /> 编辑
      </span>
    );
  }

  // 如果提供了删除函数，添加删除按钮
  if (showActions && onDelete) {
    actions.push(
      <span key="delete" onClick={() => onDelete(id)}>
        <DeleteOutlined /> 删除
      </span>
    );
  }

  // 卡片内容
  const cardContent = (
    <>
      <div className="image-card-container">
        <AntImage
          alt={name}
          src={thumbnailUrl || imageUrl}
          style={{ width: '100%', objectFit: 'cover' }}
          preview={clickable ? { src: imageUrl } : false}
          placeholder={loading ? <div className="image-placeholder" /> : undefined}
          onLoad={handleImageLoaded}
        />
        {onSelect && (
          <div className="image-select-overlay" onClick={() => onSelect(id)}>
            <div className={`image-select-checkbox ${selected ? 'selected' : ''}`} />
          </div>
        )}
      </div>
      <Meta
        title={name}
        description={
          description ? (
            <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
          ) : null
        }
      />
    </>
  );

  return (
    <Card
      hoverable={clickable}
      className={`image-card ${selected ? 'selected' : ''}`}
      cover={cardContent}
      actions={actions}
    >
      {/* 空内容，因为内容已在cover中显示 */}
    </Card>
  );
};

export default ImageCard;
