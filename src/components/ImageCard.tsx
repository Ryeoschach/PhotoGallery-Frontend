import React, { useState } from 'react';
import { Image as AntImage, Card, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './ImageCard.css'; // 引入自定义样式

const { Meta } = Card;
// const { Paragraph } = Typography;

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
  ownerUsername?: string; // 添加所有者用户名属性
  uploadDate?: string; // 添加上传日期属性
}

/**
 * 现代化图片卡片组件
 * 显示单张图片的卡片，具有更现代的外观和交互效果
 */
const ImageCard: React.FC<ImageProps> = ({
  id,
  name,
  // description,
  imageUrl,
  thumbnailUrl,
  selected = false,
  onSelect,
  onDelete,
  onEdit,
  showActions = true,
  ownerUsername, // 接收所有者用户名
  uploadDate, // 接收上传日期
}) => {
  const [loading, setLoading] = useState(true);

  const handleImageLoaded = () => {
    setLoading(false);
  };

  const formattedDate = uploadDate ? new Date(uploadDate).toLocaleDateString() : '';

  return (
    <Card
      hoverable
      className={`modern-image-card ${selected ? 'selected' : ''}`}
      cover={
        <div className="modern-image-cover">
          <AntImage
            alt={name}
            src={thumbnailUrl || imageUrl}
            preview={false} // 点击整个卡片进行导航或预览
            placeholder={loading ? <div className="image-placeholder" /> : undefined}
            onLoad={handleImageLoaded}
            style={{ display: loading ? 'none' : 'block' }}
          />
          {loading && <div className="image-loading-spinner"></div>}
          <div className="modern-image-overlay">
            <div className="modern-image-actions">
              <Tooltip title="查看详情">
                <Link to={`/images/${id}`} className="modern-action-icon">
                  <EyeOutlined />
                </Link>
              </Tooltip>
              {showActions && onEdit && (
                <Tooltip title="编辑">
                  <span onClick={() => onEdit(id)} className="modern-action-icon">
                    <EditOutlined />
                  </span>
                </Tooltip>
              )}
              {showActions && onDelete && (
                <Tooltip title="删除">
                  <span onClick={() => onDelete(id)} className="modern-action-icon modern-action-icon-delete">
                    <DeleteOutlined />
                  </span>
                </Tooltip>
              )}
            </div>
            {ownerUsername && <div className="modern-image-owner">@{ownerUsername}</div>}
          </div>
        </div>
      }
    >
      <Meta
        title={<Tooltip title={name}>{name}</Tooltip>}
        // description={
        //   <Paragraph ellipsis={{ rows: 2, expandable: false }} style={{ marginBottom: 0 }}>
        //     {description || '暂无描述'}
        //   </Paragraph>
        // }
      />
      {formattedDate && <div className="modern-image-date">{formattedDate}</div>}
      {onSelect && (
        <div
          className={`modern-image-select-indicator ${selected ? 'selected' : ''}`}
          onClick={(e) => {
            e.stopPropagation(); // 防止点击选择时触发卡片导航
            onSelect(id);
          }}
        />
      )}
    </Card>
  );
};

export default ImageCard;
