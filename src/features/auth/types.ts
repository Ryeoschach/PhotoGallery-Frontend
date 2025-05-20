// 用户类型
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
}

// 注册请求类型
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password2: string;
}

// 登录请求类型
export interface LoginRequest {
  username: string;
  password: string;
}

// 认证响应类型
export interface AuthResponse {
  access: string;
  refresh: string;
}

// 用户更新请求类型
export interface UserUpdateRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  old_password?: string;
  password?: string;
}

export interface Image {
  id: number;
  name: string;
  description?: string;
  image: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  size?: number;
  groups: number[];
  owner: string | number | null; // 添加 owner 属性，可以是字符串、数字或 null
  uploaded_at: string;
  updated_at: string;
}