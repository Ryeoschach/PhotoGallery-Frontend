import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../../app/store';
import type { User, AuthResponse, LoginRequest, RegisterRequest, UserUpdateRequest } from './types';

// 定义API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
console.log('Using API base URL:', API_BASE_URL);

// 创建API客户端
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 拦截器添加认证令牌
apiClient.interceptors.request.use(
  (config) => {
    // 每次请求前从存储中获取最新的令牌
    const token = localStorage.getItem('token');
    
    console.log(`Request to: ${config.url}, Auth token present: ${!!token}`);
    
    if (token && config.headers) {
      // 直接设置 Authorization 头部
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.url !== '/token/') { // 只对非登录请求发出警告
      console.warn('No authentication token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 注册用户
export const registerUser = createAsyncThunk<
  User, 
  RegisterRequest, 
  { rejectValue: string }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/register/', userData);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.detail || 
      (typeof err.response?.data === 'string' ? err.response.data : 'Registration failed')
    );
  }
});

// 登录用户
export const loginUser = createAsyncThunk<
  AuthResponse, 
  LoginRequest, 
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue, dispatch }) => {
  try {
    console.log('Attempting login with:', JSON.stringify(credentials));
    const response = await apiClient.post('/token/', credentials);
    const { access, refresh } = response.data;
    
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);
    
    // 登录后自动获取用户信息
    dispatch(fetchUserProfile());
    
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.detail || 
      (typeof err.response?.data === 'string' ? err.response.data : 'Login failed')
    );
  }
});

// 获取当前用户信息
export const fetchUserProfile = createAsyncThunk<
  User, 
  void, 
  { rejectValue: string }
>('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/me/');
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.detail || 
      (typeof err.response?.data === 'string' ? err.response.data : 'Failed to fetch profile')
    );
  }
});

// 更新用户个人资料
export const updateUserProfile = createAsyncThunk<
  User,
  UserUpdateRequest,
  { rejectValue: string }
>('auth/updateProfile', async (userData, { rejectWithValue }) => {
  try {
    // 使用 apiClient 发送 PATCH 请求到 /me/ 端点
    const response = await apiClient.patch('/me/', userData);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.detail || 
      (typeof err.response?.data === 'string' ? err.response.data : 'Failed to update profile')
    );
  }
});

// 注销用户
export const logoutUser = createAsyncThunk(
  'auth/logout', 
  async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    // 可以选择调用后端注销端点，取决于您的实现
    return true;
  }
);

// 添加检查认证状态的异步action
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      // apiClient 拦截器会自动添加 Authorization 头
      const response = await apiClient.get('/me/');
      
      console.log('User session restored:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to restore session:', error);
      localStorage.removeItem('token'); // 移除无效的token
      return rejectWithValue(error.message || 'Failed to restore session');
    }
  }
);

// 检查是否有有效的令牌
const checkInitialAuth = () => {
  return !!localStorage.getItem('token');
};

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: checkInitialAuth(),
  user: null,
  status: 'idle',
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 处理注册
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '注册失败';
      })
      
      // 处理登录
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.isAuthenticated = true;
        state.status = 'succeeded';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '登录失败';
      })
      
      // 处理获取用户资料
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '获取用户资料失败';
      })
      
      // 处理更新用户资料
      .addCase(updateUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '更新用户资料失败';
      })
      
      // 处理注销
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      
      // 处理检查认证状态
      .addCase(checkAuthStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.status = 'idle';
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.status = 'idle';
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('token');
      });
  }
});

export const { clearAuthError } = authSlice.actions;

// 选择器
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;