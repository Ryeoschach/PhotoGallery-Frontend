// 共享的认证状态管理
// 从Web端项目的authSlice.ts移植而来，适配移动端

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { ApiService, handleApiError } from '../../api';
import type { User, LoginRequest, RegisterRequest, UserUpdateRequest } from '../../types';

// 状态接口
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// 初始状态
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  status: 'idle',
  error: null,
};

// 异步操作需要在使用时注入ApiService实例
export const createAuthThunks = (apiService: ApiService) => {
  // 用户注册
  const registerUser = createAsyncThunk<
    User,
    RegisterRequest,
    { rejectValue: string }
  >('auth/register', async (userData, { rejectWithValue }) => {
    try {
      const response = await apiService.register(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(handleApiError(error));
    }
  });

  // 用户登录
  const loginUser = createAsyncThunk<
    { access: string; refresh?: string },
    LoginRequest,
    { rejectValue: string }
  >('auth/login', async (credentials, { rejectWithValue, dispatch }) => {
    try {
      console.log('登录请求数据:', credentials);
      
      const response = await apiService.login(credentials);
      console.log('登录响应成功:', response);
      
      // 保存token（Web端用localStorage，移动端用SecureStore）
      await saveToken(response.access);
      if (response.refresh) {
        await saveRefreshToken(response.refresh);
      }
      
      // 获取用户资料
      dispatch(fetchUserProfile());
      
      return response;
    } catch (error: any) {
      console.error('登录异常:', error);
      return rejectWithValue(handleApiError(error));
    }
  });

  // 获取当前用户信息
  const fetchUserProfile = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
  >('auth/fetchUserProfile', async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getCurrentUser();
      console.log('获取用户资料成功:', response);
      return response;
    } catch (error: any) {
      console.error('获取用户资料失败:', error);
      return rejectWithValue(handleApiError(error));
    }
  });

  // 更新用户资料
  const updateUserProfile = createAsyncThunk<
    User,
    UserUpdateRequest,
    { rejectValue: string }
  >('auth/updateUserProfile', async (userData, { rejectWithValue }) => {
    try {
      const response = await apiService.updateUserProfile(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(handleApiError(error));
    }
  });

  // 检查认证状态
  const checkAuthStatus = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
  >('auth/checkStatus', async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await apiService.getCurrentUser();
      console.log('User session restored:', response);
      return response;
    } catch (error: any) {
      console.error('Failed to restore session:', error);
      await removeToken();
      await removeRefreshToken();
      return rejectWithValue(handleApiError(error));
    }
  });

  // 注销用户
  const logoutUser = createAsyncThunk('auth/logout', async () => {
    await removeToken();
    await removeRefreshToken();
    return true;
  });

  return {
    registerUser,
    loginUser,
    fetchUserProfile,
    updateUserProfile,
    checkAuthStatus,
    logoutUser,
  };
};

// Token管理函数（需要在Web端和移动端分别实现）
declare const saveToken: (token: string) => Promise<void>;
declare const saveRefreshToken: (token: string) => Promise<void>;
declare const getToken: () => Promise<string | null>;
declare const getRefreshToken: () => Promise<string | null>;
declare const removeToken: () => Promise<void>;
declare const removeRefreshToken: () => Promise<void>;

// 创建slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    // 这里需要在运行时动态添加异步操作的处理
    // 因为异步操作依赖于注入的ApiService
  },
});

// 导出actions
export const { clearError, resetStatus } = authSlice.actions;

// 选择器
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;

// 导出reducer
export default authSlice.reducer;

// 工具函数：创建完整的认证slice（包含异步操作）
export const createAuthSliceWithThunks = (apiService: ApiService) => {
  const thunks = createAuthThunks(apiService);
  
  // 重新创建slice，添加extraReducers
  const sliceWithThunks = createSlice({
    name: 'auth',
    initialState,
    reducers: authSlice.reducer,
    extraReducers: (builder) => {
      // 处理注册
      builder
        .addCase(thunks.registerUser.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(thunks.registerUser.fulfilled, (state) => {
          state.status = 'succeeded';
        })
        .addCase(thunks.registerUser.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload || '注册失败';
        })
        
        // 处理登录
        .addCase(thunks.loginUser.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(thunks.loginUser.fulfilled, (state) => {
          state.isAuthenticated = true;
          state.status = 'succeeded';
        })
        .addCase(thunks.loginUser.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload || '登录失败';
        })
        
        // 处理获取用户资料
        .addCase(thunks.fetchUserProfile.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(thunks.fetchUserProfile.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.user = action.payload;
        })
        .addCase(thunks.fetchUserProfile.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload || '获取用户资料失败';
        })
        
        // 处理更新用户资料
        .addCase(thunks.updateUserProfile.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(thunks.updateUserProfile.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.user = action.payload;
        })
        .addCase(thunks.updateUserProfile.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload || '更新用户资料失败';
        })
        
        // 处理检查认证状态
        .addCase(thunks.checkAuthStatus.fulfilled, (state, action) => {
          state.isAuthenticated = true;
          state.user = action.payload;
          state.status = 'succeeded';
        })
        .addCase(thunks.checkAuthStatus.rejected, (state) => {
          state.isAuthenticated = false;
          state.user = null;
          state.status = 'idle';
        })
        
        // 处理注销
        .addCase(thunks.logoutUser.fulfilled, (state) => {
          state.isAuthenticated = false;
          state.user = null;
          state.status = 'idle';
          state.error = null;
        });
    },
  });
  
  return {
    slice: sliceWithThunks,
    thunks,
  };
};
