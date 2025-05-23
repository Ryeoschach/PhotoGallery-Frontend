export interface Image {
  id: number;
  name: string;
  description: string | null;
  image: string; // URL 地址
  uploaded_at: string;
  updated_at: string;
  user: number; // 用户 ID
  width: number;
  height: number;
  size: number;
  owner: string | number | null;
  thumbnail?: string; // 缩略图 URL
  groups: number[]; // 组 ID 数组
  owner_username?: string;
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
}

// 创建分组请求
export interface GroupCreateRequest {
  name: string;
  description: string;
}

// 更新分组请求
export interface GroupUpdateRequest {
  id: number;
  name: string;
  description: string;
}

// 编辑照片请求
export interface ImageUpdateRequest {
  id: number;
  name?: string;
  description?: string;
  groups?: number[];
}

// 上传照片请求
export interface ImageUploadRequest {
  name: string;
  description: string;
  image: File;
  groups?: number[];
}

// API 状态类型
export type ApiStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

// 通用API响应接口
export interface ApiResponse<T> {
  data?: T;
  status: ApiStatus;
  error?: string | null;
}