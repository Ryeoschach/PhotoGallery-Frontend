import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'; // 使用 import type 语法导入类型
import type { RootState } from '../../app/store';
import apiClient from '../../services/request';

// 用户数据的接口
export interface User {
  id: number;
  username: string;
  email?: string;
  // 根据实际 API 返回添加其他字段
}

// Slice 的状态接口
interface UsersState {
  list: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
  // 新增用户详情相关状态
  currentUser: User | null;
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  detailError: string | null | undefined;
}

// 初始状态
const initialState: UsersState = {
  list: [],
  status: 'idle',
  error: null,
  // 用户详情初始状态
  currentUser: null,
  detailStatus: 'idle',
  detailError: null,
};

// 获取用户列表的异步 thunk
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const response = await apiClient.get<User[]>('/users/');
    return response;
  }
);

// 获取单个用户详情的异步 thunk
export const fetchUserDetail = createAsyncThunk(
  'users/fetchUserDetail',
  async (username: string) => {
    const response = await apiClient.get<User>(`/users/${username}/`);
    return response;
  }
);

// 创建 Slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // 清除当前用户详情（例如，在离开用户详情页面时）
    clearCurrentUser: (state) => {
      state.currentUser = null;
      state.detailStatus = 'idle';
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 用户列表 reducers
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      // 用户详情 reducers
      .addCase(fetchUserDetail.pending, (state) => {
        state.detailStatus = 'loading';
        state.detailError = null;
      })
      .addCase(fetchUserDetail.fulfilled, (state, action: PayloadAction<User>) => {
        state.detailStatus = 'succeeded';
        state.currentUser = action.payload;
      })
      .addCase(fetchUserDetail.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.detailError = action.error.message;
      });
  },
});

// 导出 actions
export const { clearCurrentUser } = usersSlice.actions;

// 导出 reducer
export default usersSlice.reducer;

// 导出 selectors
export const selectAllUsers = (state: RootState) => state.users.list;
export const getUsersStatus = (state: RootState) => state.users.status;
export const getUsersError = (state: RootState) => state.users.error;

// 用户详情相关 selectors
export const selectUserDetail = (state: RootState) => state.users.currentUser;
export const getUserDetailStatus = (state: RootState) => state.users.detailStatus;
export const getUserDetailError = (state: RootState) => state.users.detailError;