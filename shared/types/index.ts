// 共享的TypeScript类型定义文件
// 这些类型可以在Web端和移动端之间复用

// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  images?: number[]; // 用户拥有的图片ID列表
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  password2: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

// 图片相关类型
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
  owner_username?: string;
  thumbnail?: string; // 缩略图 URL
  groups: number[]; // 组 ID 数组
}

export interface ImageUpdateRequest {
  name?: string;
  description?: string;
}

export interface ImageUploadRequest {
  image: File | string; // Web端用File，移动端可能用uri字符串
  name: string;
  description?: string;
  groups?: number[];
}

// 分组相关类型
export interface Group {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface GroupCreateRequest {
  name: string;
  description?: string;
}

export interface GroupUpdateRequest {
  name?: string;
  description?: string;
}

// 布局相关类型
export interface LayoutConfig {
  columns: number;
  featured_images: number[];
  featured_groups: number[];
  show_recent: boolean;
  recent_count: number;
  image_spacing: number;
  grid_padding: number;
}

export interface Layout {
  id: number;
  name: string;
  is_active: boolean;
  config: LayoutConfig;
  created_at: string;
  updated_at: string;
}

export interface NewLayoutData {
  name: string;
  is_active: boolean;
  config: LayoutConfig;
}

export interface UpdateLayoutData {
  name?: string;
  is_active?: boolean;
  config?: Partial<LayoutConfig>;
}

export interface UpdateLayoutSpacingData {
  image_spacing?: number;
  grid_padding?: number;
}

// API响应相关类型
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// 应用状态相关类型
export type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  status: LoadingStatus;
  error: string | null;
}

export interface ImagesState {
  list: Image[];
  status: LoadingStatus;
  error: string | null;
  currentImage: Image | null;
  detailStatus: LoadingStatus;
  detailError: string | null;
  uploadStatus: LoadingStatus;
  uploadError: string | null;
  updateStatus: LoadingStatus;
  updateError: string | null;
  deleteStatus: LoadingStatus;
  deleteError: string | null;
  selectedImageIds: number[];
  filter: string;
  page: number;
  groups: Group[];
  groupsStatus: LoadingStatus;
  groupsError: string | null;
  selectedGroupId: number | null;
}

// 移动端特有类型
export interface DeviceInfo {
  platform: 'ios' | 'android';
  screenWidth: number;
  screenHeight: number;
  isTablet: boolean;
}

export interface NavigationProps {
  navigation: any; // 具体类型根据React Navigation版本确定
  route: any;
}

// 照片查看器相关类型
export interface PhotoViewerProps {
  images: Image[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

// 网格布局相关类型
export interface GridItemSize {
  width: number;
  height: number;
}

export interface PhotoGridProps {
  images: Image[];
  numColumns: number;
  spacing: number;
  onImagePress: (image: Image, index: number) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
}
