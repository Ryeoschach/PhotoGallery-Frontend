import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import request from '../../services/request';
import type { RootState } from '../../app/store';
import type { User, LoginRequest, RegisterRequest, UserUpdateRequest } from './types';

// 定义使用 request.ts 服务发送 API 请求
console.log('使用 request.ts 服务发送 API 请求');
// 拦截器已在 request.ts 中配置

// 注册用户
// ...existing code...
export const registerUser = createAsyncThunk<
  User, 
  RegisterRequest, 
  { rejectValue: string }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await request.post('/register/', userData);
    return response;
  } catch (err: any) {
    let errorMessage = 'Registration failed'; // 默认错误信息
    if (err.response?.data) {
      if (typeof err.response.data.detail === 'string' && err.response.data.detail.trim() !== '') {
        errorMessage = err.response.data.detail;
      } else if (typeof err.response.data === 'string' && err.response.data.trim() !== '') {
        errorMessage = err.response.data;
      } else if (typeof err.response.data === 'object') {
        // 尝试从常见的错误结构中提取，例如 Django REST framework 的字段错误
        const fieldErrors = Object.values(err.response.data).flat().join(' ');
        if (fieldErrors.trim() !== '') {
          errorMessage = fieldErrors;
        }
      }
    }
    return rejectWithValue(errorMessage);
  }
});

// ...existing code...

// 登录用户
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue, dispatch }) => {
    try {
      console.log('登录请求数据:', credentials); // 添加日志
      
      // 使用原始fetch API代替request库
      const response = await fetch('/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('登录响应错误:', errorData);
        
        // 提取有意义的错误消息
        let errorMessage = '登录失败';
        
        if (errorData.username) {
          errorMessage = `用户名错误: ${errorData.username.join(', ')}`;
        } else if (errorData.password) {
          errorMessage = `密码错误: ${errorData.password.join(', ')}`;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
        
        return rejectWithValue(errorMessage);
      }
      
      const data = await response.json();
      console.log('登录响应成功:', data);
      
      // 保存token到localStorage
      localStorage.setItem('token', data.access);
      
      // 获取用户资料
      dispatch(fetchUserProfile());
      
      return data;
    } catch (error) {
      console.error('登录异常:', error);
      return rejectWithValue('登录失败，请重试');
    }
  }
);

// 获取当前用户信息
export const fetchUserProfile = createAsyncThunk<
  User, 
  void, 
  { rejectValue: string }
>('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await request.get('/me/');
    return response;
  } catch (err: any) {
    let errorMessage = '获取用户资料失败'; // 默认错误信息
    if (err.response?.data) {
      if (typeof err.response.data.detail === 'string') {
        errorMessage = err.response.data.detail;
      } else if (typeof err.response.data === 'string') {
        errorMessage = err.response.data;
      } else if (typeof err.response.data === 'object' && Object.keys(err.response.data).length > 0) {
        // 尝试从常见的错误结构中提取信息或序列化
        const errorData = err.response.data;
        if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
          errorMessage = errorData.non_field_errors.join(', ');
        } else {
          try {
            errorMessage = JSON.stringify(errorData);
          } catch (e) {
            // 序列化失败，保持默认
          }
        }
      }
    }
    return rejectWithValue(errorMessage);
  }
});

// 更新用户个人资料
export const updateUserProfile = createAsyncThunk<
  User,
  UserUpdateRequest,
  { rejectValue: string }
>('auth/updateProfile', async (userData, { rejectWithValue }) => {
  try {
    const response = await request.patch('/me/', userData);
    return response;
  } catch (err: any) {
    let errorMessage = 'Failed to update profile'; // 默认错误信息
    if (err.response?.data) {
      if (typeof err.response.data.detail === 'string' && err.response.data.detail.trim() !== '') {
        errorMessage = err.response.data.detail;
      } else if (typeof err.response.data === 'string' && err.response.data.trim() !== '') {
        errorMessage = err.response.data;
      } else if (typeof err.response.data === 'object') {
        const fieldErrors = Object.values(err.response.data).flat().join(' ');
        if (fieldErrors.trim() !== '') {
          errorMessage = fieldErrors;
        }
      }
    }
    return rejectWithValue(errorMessage);
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
        return rejectWithValue('No token found'); // 确保是字符串
      }

      const response = await request.get('/me/');
      console.log('User session restored:', response);
      return response;
    } catch (error: any) {
      console.error('Failed to restore session:', error);
      localStorage.removeItem('token');
      // 确保 error.message 是字符串，或者提供一个默认字符串
      let errorMessage = 'Failed to restore session';
      if (error.response?.data?.detail && typeof error.response.data.detail === 'string') {
        errorMessage = error.response.data.detail;
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
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
        state.error = typeof action.payload === 'string' ? action.payload : '注册失败';
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
        state.error = typeof action.payload === 'string' ? action.payload : '登录失败';
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
        state.error = typeof action.payload === 'string' ? action.payload : '获取用户资料失败';
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
        state.error = typeof action.payload === 'string' ? action.payload : '更新用户资料失败';
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