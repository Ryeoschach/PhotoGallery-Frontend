// src/features/layout/types.ts

/**
 * 布局配置接口
 */
export interface LayoutConfig {
  columns: number; // 列数
  featured_images: number[]; // 特色图片ID列表
  featured_groups: number[]; // 特色分组ID列表
  show_recent: boolean; // 是否显示最近图片
  recent_count: number; // 最近图片数量
  image_spacing: number; // 图片间距
  grid_padding: number; // 网格内边距
}

/**
 * 布局对象接口
 */
export interface Layout {
  id: number; // 布局ID
  name: string; // 布局名称
  is_active: boolean; // 是否为当前激活布局
  config: LayoutConfig; // 布局具体配置
  created_at: string; // 创建时间
  updated_at: string; // 更新时间
  owner?: number; // 可选，如果API返回
}

/**
 * 创建新布局时发送的数据接口 (不包含id, created_at, updated_at)
 */
export type NewLayoutData = Omit<Layout, 'id' | 'created_at' | 'updated_at' | 'owner'>;

/**
 * 更新布局时发送的数据接口 (所有字段可选)
 */
export type UpdateLayoutData = Partial<NewLayoutData>;

/**
 * 更新布局间距设置时发送的数据接口
 */
export interface UpdateLayoutSpacingData {
  image_spacing?: number;
  grid_padding?: number;
}
