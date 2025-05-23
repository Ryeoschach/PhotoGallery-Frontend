import React from 'react';
import { Card } from 'antd';
import type { CardProps } from 'antd/lib/card';

interface PageCardProps extends CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 页面卡片组件 - 为应用中的主要内容区域提供一致的样式
 */
const PageCard: React.FC<PageCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  ...cardProps
}) => {
  return (
    <div className="fade-in">
      {(title || subtitle) && (
        <div className="page-header">
          {title && <h1 className="page-title">{title}</h1>}
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      )}
      
      <Card 
        className={`modern-card ${className}`}
        bordered={false}
        {...cardProps}
      >
        <div className="modern-card-body">
          {children}
        </div>
      </Card>
    </div>
  );
};

export default PageCard;
