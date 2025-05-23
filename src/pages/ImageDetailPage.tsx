import React from 'react';
import ImageDetail from '../features/images/ImageDetail';
import PageCard from '../components/PageCard';

const ImageDetailPage: React.FC = () => {
  return (
    <div className="fade-in">
      <PageCard>
        <ImageDetail />
      </PageCard>
    </div>
  );
};

export default ImageDetailPage;