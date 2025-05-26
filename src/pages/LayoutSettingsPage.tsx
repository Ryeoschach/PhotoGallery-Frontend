// src/pages/LayoutSettingsPage.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../app/store';
import {
  fetchLayouts,
  fetchActiveLayout,
  createLayout,
  updateLayout,
  activateLayout,
  deleteLayout,
  updateLayoutSpacing,
} from '../features/layout/layoutSlice';
import type { Layout, NewLayoutData, UpdateLayoutData, UpdateLayoutSpacingData, LayoutConfig } from '../features/layout/types';
import styles from './LayoutSettingsPage.module.css'; // 为页面创建样式文件
import PageCard from '../components/PageCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const LayoutSettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { layouts, activeLayout, status, error } = useSelector((state: RootState) => state.layouts);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<{
    id?: number;
    name: string;
    is_active: boolean;
    config: LayoutConfig;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchLayouts());
    dispatch(fetchActiveLayout());
  }, [dispatch]);

  const openModal = (layout?: Layout) => {
    if (layout) {
      setCurrentLayout({ ...layout, config: { ...layout.config } }); // 深拷贝 config
      setIsEditing(true);
    } else {
      // 为新布局设置默认值，确保 config 对象存在
      setCurrentLayout({
        name: '',
        is_active: false,
        config: {
          columns: 3,
          featured_images: [],
          featured_groups: [],
          show_recent: true,
          recent_count: 6,
          image_spacing: 8,
          grid_padding: 16,
        },
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentLayout(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (currentLayout) {
      // 检查属性是否属于 config 对象
      if (['columns', 'featured_images', 'featured_groups', 'show_recent', 'recent_count', 'image_spacing', 'grid_padding'].includes(name)) {
        // 处理配置属性
        setCurrentLayout({
          ...currentLayout,
          config: {
            ...currentLayout.config,
            [name]: type === 'number' 
              ? parseInt(value, 10) 
              : type === 'checkbox' 
                ? (e.target as HTMLInputElement).checked 
                : value,
          },
        });
      } else {
        // 处理顶级属性
        setCurrentLayout({
          ...currentLayout,
          [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        });
      }
    }
  };

 const handleConfigListChange = (fieldName: 'featured_images' | 'featured_groups', value: string) => {
    if (currentLayout) {
      // 增强的分隔符处理
      // 支持英文逗号、中文逗号、分号、空格等多种分隔符
      const cleanedValue = value.replace(/[，;；]+/g, ','); // 将中文逗号、分号等替换为英文逗号
      const numArray = cleanedValue.split(/[,\s]+/) // 按逗号或空格分割
        .map(item => {
          const trimmed = item.trim();
          return trimmed ? parseInt(trimmed, 10) : NaN;
        })
        .filter(item => !isNaN(item)); // 过滤掉非数字
      
      console.log('处理列表输入:', { fieldName, value, numArray });
      
      setCurrentLayout({
        ...currentLayout,
        config: {
          ...currentLayout.config,
          [fieldName]: numArray,
        },
      });
    }
  };

  const handleSubmit = async () => {
    if (!currentLayout || !currentLayout.name) return;

    // 确保所有 config 字段都存在
    const fullConfig: LayoutConfig = {
        columns: currentLayout.config.columns,
        featured_images: currentLayout.config.featured_images,
        featured_groups: currentLayout.config.featured_groups,
        show_recent: currentLayout.config.show_recent,
        recent_count: currentLayout.config.recent_count,
        image_spacing: currentLayout.config.image_spacing,
        grid_padding: currentLayout.config.grid_padding,
    };

    // 记录当前布局是否被设置为激活
    const isLayoutActive = currentLayout.is_active;
    // 记录当前编辑的布局ID
    const layoutId = isEditing && currentLayout.id ? currentLayout.id : null;

    if (isEditing && layoutId) {
      const layoutDataToUpdate: UpdateLayoutData = {
        name: currentLayout.name,
        is_active: isLayoutActive,
        config: fullConfig,
      };
      await dispatch(updateLayout({ id: layoutId, ...layoutDataToUpdate }));
      
      // 如果布局被设置为激活，显式调用 activateLayout 来确保它被应用
      if (isLayoutActive) {
        await dispatch(activateLayout(layoutId));
      }
    } else {
      const newLayoutData: NewLayoutData = {
        name: currentLayout.name,
        is_active: isLayoutActive,
        config: fullConfig,
      };
      const result = await dispatch(createLayout(newLayoutData));
      
      // 获取新创建的布局ID
      // @ts-ignore - 忽略类型检查，因为我们知道 payload 中有 id
      const newLayoutId = result.payload?.id;
      
      // 如果新布局被设置为激活，显式调用 activateLayout 来确保它被应用
      if (isLayoutActive && newLayoutId) {
        await dispatch(activateLayout(newLayoutId));
      }
    }
    closeModal();
    // 重新获取列表和激活布局以更新UI
    dispatch(fetchLayouts()); 
    dispatch(fetchActiveLayout());
  };

  const handleActivate = async (id: number) => {
    console.log('开始激活布局:', id);
    await dispatch(activateLayout(id));
    console.log('布局激活完成，正在刷新数据');
    await dispatch(fetchLayouts()); // 重新获取列表以更新is_active状态
    await dispatch(fetchActiveLayout());
    console.log('数据刷新完成');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这个布局吗？')) {
      await dispatch(deleteLayout(id));
      dispatch(fetchLayouts());
      // 如果删除的是当前激活的布局，需要重新获取激活布局
      // layoutSlice 中已经处理了 activeLayout 的更新逻辑
      if (activeLayout && activeLayout.id === id) {
        dispatch(fetchActiveLayout());
      }
    }
  };
  
  const handleUpdateSpacing = async (id: number, spacingData: UpdateLayoutSpacingData) => {
    await dispatch(updateLayoutSpacing({ id, ...spacingData }));
    dispatch(fetchLayouts());
    dispatch(fetchActiveLayout());
  };

  if (status === 'loading' && !isModalOpen) {
    return <LoadingState status="loading" loadingMessage="正在加载布局设置...">
      <></>
    </LoadingState>;
  }

  if (status === 'failed' && error) {
    return <EmptyState message={`加载失败: ${error}`} />;
  }

  return (
    <PageCard title="布局管理">
      <div className={styles.layoutSettingsPage}>
        <button onClick={() => openModal()} className={styles.addButton}>
          创建新布局
        </button>

        {layouts.length === 0 && status === 'succeeded' && (
          <EmptyState message="还没有创建任何布局。" />
        )}

        <div className={styles.layoutList}>
          {layouts.map((layout) => (
            <div key={layout.id} className={`${styles.layoutCard} ${layout.is_active ? styles.active : ''}`}>
              <h3>{layout.name} {layout.is_active && "(当前激活)"}</h3>
              <div className={styles.configDetails}>
                <p>列数: {layout.config.columns}</p>
                <p>图片间距: {layout.config.image_spacing}px</p>
                <p>网格内边距: {layout.config.grid_padding}px</p>
                <p>显示最近: {layout.config.show_recent ? '是' : '否'} (数量: {layout.config.recent_count})</p>
                <p>特色图片 IDs: {layout.config.featured_images.join(', ') || '无'}</p>
                <p>特色分组 IDs: {layout.config.featured_groups.join(', ') || '无'}</p>
              </div>
              <div className={styles.actions}>
                <button onClick={() => openModal(layout)} className={styles.editButton}>编辑</button>
                {!layout.is_active && (
                  <button onClick={() => handleActivate(layout.id)} className={styles.activateButton}>
                    设为激活
                  </button>
                )}
                <button onClick={() => handleDelete(layout.id)} className={styles.deleteButton}>
                  删除
                </button>
                {layout.is_active && (
                  <button 
                    onClick={() => {
                      // 创建更友好的界面体验
                      const newSpacing = window.prompt('请输入新的图片间距 (px)：\n\n当前值：' + layout.config.image_spacing + 'px', String(layout.config.image_spacing));
                      
                      // 如果用户点击取消，则停止后续操作
                      if (newSpacing === null) return;
                      
                      const newPadding = window.prompt('请输入新的网格内边距 (px)：\n\n当前值：' + layout.config.grid_padding + 'px', String(layout.config.grid_padding));
                      
                      // 只有在两个值都不为null时才进行更新
                      if (newPadding !== null) {
                        // 转换为数字并验证
                        const spacingValue = parseInt(newSpacing, 10);
                        const paddingValue = parseInt(newPadding, 10);
                        
                        // 如果输入无效，则保留原值
                        handleUpdateSpacing(layout.id, {
                          image_spacing: isNaN(spacingValue) ? layout.config.image_spacing : spacingValue,
                          grid_padding: isNaN(paddingValue) ? layout.config.grid_padding : paddingValue
                        });
                      }
                    }} 
                    className={styles.spacingButton}
                  >
                    快速调整间距
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && currentLayout && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
              <h2>{isEditing ? '编辑布局' : '创建新布局'}</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">布局名称:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={currentLayout.name || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="is_active">设为激活:</label>
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={!!currentLayout.is_active}
                    onChange={handleInputChange}
                  />
                </div>
                
                <h4>配置:</h4>
                <div className={styles.formGroup}>
                  <label htmlFor="columns">列数:</label>
                  <input
                    type="number"
                    id="columns"
                    name="columns"
                    value={currentLayout.config?.columns ?? ''}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="image_spacing">图片间距 (px):</label>
                  <input
                    type="number"
                    id="image_spacing"
                    name="image_spacing"
                    value={currentLayout.config?.image_spacing ?? ''}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="grid_padding">网格内边距 (px):</label>
                  <input
                    type="number"
                    id="grid_padding"
                    name="grid_padding"
                    value={currentLayout.config?.grid_padding ?? ''}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                 <div className={styles.formGroup}>
                  <label htmlFor="show_recent">显示最近上传:</label>
                  <input
                    type="checkbox"
                    id="show_recent"
                    name="show_recent"
                    checked={!!currentLayout.config?.show_recent}
                    onChange={handleInputChange}
                  />
                </div>
                {currentLayout.config?.show_recent && (
                    <div className={styles.formGroup}>
                        <label htmlFor="recent_count">最近上传数量:</label>
                        <input
                        type="number"
                        id="recent_count"
                        name="recent_count"
                        value={currentLayout.config?.recent_count ?? ''}
                        onChange={handleInputChange}
                        min="1"
                        />
                    </div>
                )}
                <div className={styles.formGroup}>
                  <label htmlFor="featured_images">特色图片 IDs (逗号分隔):</label>
                  <input
                    type="text"
                    id="featured_images"
                    name="featured_images"
                    value={currentLayout.config?.featured_images?.join(', ') ?? ''}
                    onChange={(e) => handleConfigListChange('featured_images', e.target.value)}
                    placeholder="输入图片ID，用逗号分隔，如: 1, 2, 3"
                    autoComplete="off"
                  />
                  <small className={styles.helpText}>
                    可以使用英文逗号、中文逗号、空格或分号分隔多个ID。<br/>
                    图片ID可以在"我的照片"页面中的图片卡片上找到。
                  </small>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="featured_groups">特色分组 IDs (逗号分隔):</label>
                  <input
                    type="text"
                    id="featured_groups"
                    name="featured_groups"
                    value={currentLayout.config?.featured_groups?.join(', ') ?? ''}
                    onChange={(e) => handleConfigListChange('featured_groups', e.target.value)}
                    placeholder="输入分组ID，用逗号分隔，如: 1, 2, 3"
                    autoComplete="off"
                  />
                  <small className={styles.helpText}>
                    可以使用英文逗号、中文逗号、空格或分号分隔多个ID。<br/>
                    分组ID可以在"按分组过滤"选择框中查看。
                  </small>
                </div>

                <div className={styles.modalActions}>
                  <button type="submit" className={styles.saveButton}>{isEditing ? '保存更改' : '创建布局'}</button>
                  <button type="button" onClick={closeModal} className={styles.cancelButton}>取消</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageCard>
  );
};

export default LayoutSettingsPage;
