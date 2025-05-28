import React, { useEffect, useState } from 'react';
import { Row, Col, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchImages, selectImagesStatus, setFilter } from '../features/images/imagesSlice';
import ImageGrid from '../features/images/ImageGrid';
import GroupSelector from '../features/images/GroupSelector';
import PageCard from '../components/PageCard';
import LoadingState from '../components/LoadingState';
import FeaturedPhoto from '../components/FeaturedPhoto'; // 导入FeaturedPhoto组件
import type { AppDispatch, RootState } from '../app/store';
import {
  fetchActiveLayout,
  createLayout,
  updateLayout,
  activateLayout, // 导入 activateLayout
} from '../features/layout/layoutSlice';
import type { Layout, NewLayoutData, UpdateLayoutData, LayoutConfig } from '../features/layout/types'; // 导入布局相关类型
import styles from './HomePage.module.css'; // 如果需要特定样式，创建此文件

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const imagesStatus = useSelector(selectImagesStatus);
  const activeLayout = useSelector((state: RootState) => state.layouts.activeLayout); // 获取激活的布局

  // 布局编辑模态框的状态
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [currentLayoutForModal, setCurrentLayoutForModal] = useState<{
    id?: number;
    name: string;
    is_active: boolean;
    config: LayoutConfig;
  } | null>(null);
  const [isEditingLayout, setIsEditingLayout] = useState(false);

  useEffect(() => {
    console.log('HomePage: 重置过滤器为 "all" 并加载所有照片及激活布局');
    dispatch(setFilter('all'));
    dispatch(fetchImages());
    dispatch(fetchActiveLayout()); // 获取当前激活的布局
  }, [dispatch]);
  
  // 添加一个新的 useEffect 来监听 activeLayout 的变化
  useEffect(() => {
    console.log('HomePage: activeLayout 已更新:', activeLayout);
    if (activeLayout) {
      console.log('当前布局配置:', activeLayout.config);
      
      // 在此处不再手动操作DOM，改为通过重新渲染组件来实现布局更新
      // 通过 key 属性变化触发 ImageGrid 组件的完全重新渲染
    }
  }, [activeLayout]);
  
  
  // --- 布局编辑相关函数 ---
  const openLayoutModal = (layoutToEdit?: Layout) => {
    if (layoutToEdit) {
      // 编辑现有布局
      setCurrentLayoutForModal({
        id: layoutToEdit.id,
        name: layoutToEdit.name,
        is_active: layoutToEdit.is_active,
        config: { ...layoutToEdit.config } // 复制配置对象
      });
      setIsEditingLayout(true);
    } else {
      // 创建一个完整的 LayoutConfig 对象，确保所有必需的属性都有值
      const defaultConfig: LayoutConfig = {
        columns: 3,
        featured_images: [],
        featured_groups: [],
        show_recent: true,
        recent_count: 6,
        image_spacing: 8,
        grid_padding: 16,
      };
      
      // 创建新布局
      setCurrentLayoutForModal({
        name: '',
        is_active: true, // 新建布局默认为激活，如果已有激活布局，后端会处理
        config: defaultConfig,
      });
      setIsEditingLayout(false);
    }
    setIsLayoutModalOpen(true);
  };

  const closeLayoutModal = () => {
    setIsLayoutModalOpen(false);
    setCurrentLayoutForModal(null);
  };

  const handleLayoutInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (currentLayoutForModal) {
      // 检查属性是否属于 config 对象
      if (['columns', 'featured_images', 'featured_groups', 'show_recent', 'recent_count', 'image_spacing', 'grid_padding'].includes(name)) {
        // 处理配置属性
        setCurrentLayoutForModal({
          ...currentLayoutForModal,
          config: {
            ...currentLayoutForModal.config,
            [name]: type === 'number' 
              ? parseInt(value, 10) 
              : type === 'checkbox' 
                ? (e.target as HTMLInputElement).checked 
                : value,
          },
        });
      } else {
        // 处理顶级属性
        setCurrentLayoutForModal({
          ...currentLayoutForModal,
          [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        });
      }
    }
  };

  const handleLayoutConfigListChange = (fieldName: 'featured_images' | 'featured_groups', value: string) => {
    if (currentLayoutForModal) {
      // 解析逗号分隔的字符串为数字数组
      const numArray = value.split(',')
        .map(item => parseInt(item.trim(), 10))
        .filter(item => !isNaN(item));
      
      setCurrentLayoutForModal({
        ...currentLayoutForModal,
        config: {
          ...currentLayoutForModal.config,
          [fieldName]: numArray,
        },
      });
    }
  };

  const handleLayoutSubmit = async () => {
    if (!currentLayoutForModal || !currentLayoutForModal.name) return;

    // 确保 config 对象包含所有必需的字段
    const fullConfig: LayoutConfig = {
      columns: currentLayoutForModal.config.columns,
      featured_images: currentLayoutForModal.config.featured_images,
      featured_groups: currentLayoutForModal.config.featured_groups,
      show_recent: currentLayoutForModal.config.show_recent,
      recent_count: currentLayoutForModal.config.recent_count,
      image_spacing: currentLayoutForModal.config.image_spacing,
      grid_padding: currentLayoutForModal.config.grid_padding,
    };

    // 记录当前布局是否被设置为激活
    const isLayoutActive = currentLayoutForModal.is_active;
    // 记录当前编辑的布局ID
    const layoutId = isEditingLayout && currentLayoutForModal.id ? currentLayoutForModal.id : null;

    console.log('提交布局表单:', { 
      isEditingLayout, 
      layoutId, 
      isLayoutActive, 
      config: fullConfig 
    });

    if (isEditingLayout && layoutId) {
      // 更新现有布局
      const layoutDataToUpdate: UpdateLayoutData = {
        name: currentLayoutForModal.name,
        is_active: isLayoutActive,
        config: fullConfig,
      };
      await dispatch(updateLayout({ id: layoutId, ...layoutDataToUpdate }));
      
      // 如果布局被设置为激活，显式调用 activateLayout 来确保它被应用
      if (isLayoutActive) {
        console.log('正在激活已更新的布局:', layoutId);
        await dispatch(activateLayout(layoutId));
      }
    } else {
      // 创建新布局
      const newLayoutData: NewLayoutData = {
        name: currentLayoutForModal.name,
        is_active: isLayoutActive,
        config: fullConfig,
      };
      console.log('正在创建新布局:', newLayoutData);
      const result = await dispatch(createLayout(newLayoutData));
      
      // 获取新创建的布局ID
      // @ts-ignore - 忽略类型检查，因为我们知道 payload 中有 id
      const newLayoutId = result.payload?.id;
      console.log('新布局创建成功，ID:', newLayoutId);
      
      // 如果新布局被设置为激活，显式调用 activateLayout 来确保它被应用
      if (isLayoutActive && newLayoutId) {
        console.log('正在激活新创建的布局:', newLayoutId);
        await dispatch(activateLayout(newLayoutId));
      }
    }
    
    closeLayoutModal();
    // 重新获取激活布局以更新首页显示
    console.log('重新获取激活布局');
    await dispatch(fetchActiveLayout()); 
    
    // 这里添加一个轻微延时，确保布局获取完成后，组件已经重新渲染
    setTimeout(() => {
      console.log('当前激活布局:', activeLayout);
    }, 500);
  };

  // --- 结束 布局编辑相关函数 ---

  // 从 activeLayout 中提取配置，如果不存在则使用默认值
  const layoutConfig = activeLayout?.config;
  
  // 计算特色图片的ID列表，用于在完整库中排除（只计算第一张特色图片）
  const getFeaturedImageIds = () => {
    const featuredIds = new Set<number>();
    
    // 只添加第一张特色图片ID
    if (layoutConfig?.featured_images && layoutConfig.featured_images.length > 0) {
      featuredIds.add(layoutConfig.featured_images[0]);
    }
    
    return Array.from(featuredIds);
  };
  
  // 添加日志检测布局配置是否正确传递
  console.log('HomePage 渲染时的 layoutConfig:', { 
    activeLayout, 
    layoutConfig, 
    columns: layoutConfig?.columns,
    imageSpacing: layoutConfig?.image_spacing,
    gridPadding: layoutConfig?.grid_padding
  });

  return (
    <div className="fade-in">
      <PageCard
        title="欢迎来到照片库"
        subtitle="一个用于管理用户和照片的React + Django应用程序"
      >
        {/* 特色照片区域 - 只显示1张特色照片，完全展示 */}
        {layoutConfig && layoutConfig.featured_images?.length > 0 && (
          <FeaturedPhoto 
            imageId={layoutConfig.featured_images[0]} // 只取第一张特色照片
            key={`featured-photo-${activeLayout?.id ?? 'default'}-${layoutConfig.featured_images[0]}`}
          />
        )}

        {/* 控制区域 */}
        <Row gutter={[16, 24]} className={styles.controlSection}>
          <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space direction="vertical">
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <GroupSelector />
              </div>
            </Space>
            <Space>
              <button onClick={() => openLayoutModal()} className={styles.actionButton}>
                创建新布局
              </button>
              {activeLayout && (
                <button onClick={() => openLayoutModal(activeLayout)} className={styles.actionButton}>
                  编辑当前布局 ("{activeLayout.name}")
                </button>
              )}
            </Space>
          </Col>
        </Row>
        
        {/* 完整照片网格区域 */}
        <div className={styles.fullGallerySection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🖼️ 完整照片库</h2>
            <div className={styles.layoutInfo}>
              当前布局: {activeLayout?.name || '默认布局'} 
              ({layoutConfig?.columns || 4}列, 间距{layoutConfig?.image_spacing || 16}px)
            </div>
          </div>
          
          <LoadingState status={imagesStatus}>
            <div className="grid-wrapper" key={`layout-${activeLayout?.id}-${Date.now()}`}>
              <ImageGrid
                filter="all"
                columns={layoutConfig?.columns ?? 4} 
                imageSpacing={layoutConfig?.image_spacing ?? 16}
                gridPadding={layoutConfig?.grid_padding ?? 16}
                featuredImages={[]} // 完整库中不重复显示特色图片
                featuredGroups={[]} // 完整库中不显示特色分组
                showRecent={layoutConfig?.show_recent ?? true}
                recentCount={layoutConfig?.recent_count ?? 6}
                excludeImages={getFeaturedImageIds()} // 排除特色图片
                key={`full-grid-${activeLayout?.id ?? 'default'}-${layoutConfig?.columns ?? 4}-${layoutConfig?.image_spacing ?? 16}-${Date.now()}`} 
              />
            </div>
          </LoadingState>
        </div>
      </PageCard>

      {/* 布局编辑模态框 */}
      {isLayoutModalOpen && currentLayoutForModal && (
        <div className={styles.modalBackdrop}> {/* 使用与LayoutSettingsPage类似的样式 */}
          <div className={styles.modalContent}>
            <h2>{isEditingLayout ? '编辑布局' : '创建新布局'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleLayoutSubmit(); }}>
              <div className={styles.formGroup}>
                <label htmlFor="layout_name">布局名称:</label>
                <input
                  type="text"
                  id="layout_name" // 确保ID唯一性，或传递给通用组件
                  name="name"
                  value={currentLayoutForModal.name || ''}
                  onChange={handleLayoutInputChange}
                  required
                />
              </div>

              {/* is_active 可以在创建时设置，编辑时通常由专门的 "激活" 按钮处理，但这里保持简单 */}
              <div className={styles.formGroup}>
                <label htmlFor="layout_is_active">设为激活:</label>
                <input
                  type="checkbox"
                  id="layout_is_active"
                  name="is_active"
                  checked={!!currentLayoutForModal.is_active}
                  onChange={handleLayoutInputChange}
                />
              </div>
              
              <h4>配置:</h4>
              <div className={styles.formGroup}>
                <label htmlFor="layout_columns">列数:</label>
                <input
                  type="number"
                  id="layout_columns"
                  name="columns"
                  value={currentLayoutForModal.config?.columns ?? ''}
                  onChange={handleLayoutInputChange}
                  min="1"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="layout_image_spacing">图片间距 (px):</label>
                <input
                  type="number"
                  id="layout_image_spacing"
                  name="image_spacing"
                  value={currentLayoutForModal.config?.image_spacing ?? ''}
                  onChange={handleLayoutInputChange}
                  min="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="layout_grid_padding">网格内边距 (px):</label>
                <input
                  type="number"
                  id="layout_grid_padding"
                  name="grid_padding"
                  value={currentLayoutForModal.config?.grid_padding ?? ''}
                  onChange={handleLayoutInputChange}
                  min="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="layout_show_recent">显示最近上传:</label>
                <input
                  type="checkbox"
                  id="layout_show_recent"
                  name="show_recent"
                  checked={!!currentLayoutForModal.config?.show_recent}
                  onChange={handleLayoutInputChange}
                />
              </div>
              {currentLayoutForModal.config?.show_recent && (
                  <div className={styles.formGroup}>
                      <label htmlFor="layout_recent_count">最近上传数量:</label>
                      <input
                      type="number"
                      id="layout_recent_count"
                      name="recent_count"
                      value={currentLayoutForModal.config?.recent_count ?? ''}
                      onChange={handleLayoutInputChange}
                      min="1"
                      />
                  </div>
              )}
              <div className={styles.formGroup}>
                <label htmlFor="layout_featured_images">特色图片 ID (只需要1张):</label>
                <input
                  type="text"
                  id="layout_featured_images"
                  name="featured_images"
                  placeholder="例如: 1"
                  value={currentLayoutForModal.config?.featured_images?.join(', ') ?? ''}
                  onChange={(e) => handleLayoutConfigListChange('featured_images', e.target.value)}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveButton}>{isEditingLayout ? '保存更改' : '创建布局'}</button>
                <button type="button" onClick={closeLayoutModal} className={styles.cancelButton}>取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
