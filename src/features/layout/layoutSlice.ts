// src/features/layout/layoutSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../services/request'; // 确保路径正确
import type { Layout, NewLayoutData, UpdateLayoutData, UpdateLayoutSpacingData } from './types';

/**
 * LayoutState 接口定义了布局模块的状态结构。
 */
interface LayoutState {
  layouts: Layout[]; // 当前用户的所有布局列表
  activeLayout: Layout | null; // 当前激活的布局
  status: 'idle' | 'loading' | 'succeeded' | 'failed'; // 加载状态
  error: string | null; // 错误信息
}

// 初始状态
const initialState: LayoutState = {
  layouts: [],
  activeLayout: null,
  status: 'idle',
  error: null,
};

// 异步 Thunks

/**
 * 获取用户所有布局
 */
export const fetchLayouts = createAsyncThunk('layouts/fetchLayouts', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<Layout[]>('/layouts/');
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch layouts');
  }
});

/**
 * 获取当前激活的布局
 */
export const fetchActiveLayout = createAsyncThunk('layouts/fetchActiveLayout', async (_, { rejectWithValue }) => {
  try {
    console.log('开始获取激活布局...');
    const response = await apiClient.get<Layout>('/layouts/active/');
    console.log('获取激活布局响应:', response); 
    return response;
  } catch (error: any) {
    console.error('获取激活布局失败:', error);
    return rejectWithValue(error.message || 'Failed to fetch active layout');
  }
});

/**
 * 创建新布局
 * @param newLayoutData - 新布局的数据
 */
export const createLayout = createAsyncThunk('layouts/createLayout', async (newLayoutData: NewLayoutData, { rejectWithValue }) => {
  try {
    // 使用正确的 umi-request 参数结构：第一个参数是 URL，第二个参数是 options 对象（包含数据）
    const response = await apiClient.post<Layout>('/layouts/', { data: newLayoutData });
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create layout');
  }
});

/**
 * 更新布局
 * @param id - 布局ID
 * @param updateLayoutData - 需要更新的布局数据
 */
export const updateLayout = createAsyncThunk('layouts/updateLayout', async ({ id, ...updateLayoutData }: { id: number } & UpdateLayoutData, { rejectWithValue }) => {
  try {
    // 使用正确的 umi-request 参数结构：第一个参数是 URL，第二个参数是 options 对象（包含数据）
    const response = await apiClient.patch<Layout>(`/layouts/${id}/`, { data: updateLayoutData });
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to update layout');
  }
});

/**
 * 激活特定布局
 * @param id - 布局ID
 */
export const activateLayout = createAsyncThunk('layouts/activateLayout', async (id: number, { rejectWithValue }) => {
  try {
    // 使用正确的 umi-request 参数结构：第一个参数是 URL，第二个参数是 options 对象
    const response = await apiClient.post<Layout>(`/layouts/${id}/activate/`, {});
    console.log('激活布局响应:', response); // 添加日志检查响应
    return response; // 直接返回响应，不试图访问 data 属性
  } catch (error: any) {
    console.error('激活布局失败:', error); // 添加错误日志
    return rejectWithValue(error.message || 'Failed to activate layout');
  }
});

/**
 * 更新布局间距设置
 * @param id - 布局ID
 * @param spacingData - 间距数据
 */
export const updateLayoutSpacing = createAsyncThunk('layouts/updateLayoutSpacing', async ({ id, ...spacingData }: { id: number } & UpdateLayoutSpacingData, { rejectWithValue }) => {
  try {
    // 使用正确的 umi-request 参数结构：第一个参数是 URL，第二个参数是 options 对象（包含数据）
    console.log('更新布局间距设置:', { id, spacingData });
    const response = await apiClient.patch<Layout>(`/layouts/${id}/update_spacing/`, { data: spacingData });
    console.log('更新布局间距响应:', response);
    return response;
  } catch (error: any) {
    console.error('更新布局间距失败:', error);
    return rejectWithValue(error.message || 'Failed to update layout spacing');
  }
});

/**
 * 删除布局
 * @param id - 布局ID
 */
export const deleteLayout = createAsyncThunk('layouts/deleteLayout', async (id: number, { rejectWithValue }) => {
  try {
    // 使用正确的 umi-request 参数结构：第一个参数是 URL，第二个参数是 options 对象
    await apiClient.delete(`/layouts/${id}/`, {});
    return id; // 返回被删除的布局ID，用于在reducer中更新状态
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to delete layout');
  }
});

// Layout Slice
const layoutSlice = createSlice({
  name: 'layouts',
  initialState,
  reducers: {
    // 同步的 reducers (如果需要)
    resetLayoutStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLayouts
      .addCase(fetchLayouts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLayouts.fulfilled, (state, action: PayloadAction<Layout[]>) => {
        state.status = 'succeeded';
        state.layouts = action.payload;
      })
      .addCase(fetchLayouts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // fetchActiveLayout
      .addCase(fetchActiveLayout.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchActiveLayout.fulfilled, (state, action: PayloadAction<Layout>) => {
        state.status = 'succeeded';
        state.activeLayout = action.payload;
      })
      .addCase(fetchActiveLayout.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // createLayout
      .addCase(createLayout.fulfilled, (state, action: PayloadAction<Layout>) => {
        state.layouts.push(action.payload);
        if (action.payload.is_active) {
          state.activeLayout = action.payload;
        }
        // 如果新创建的布局是激活的，或者当前没有激活布局，则将其设为激活布局
        if (action.payload.is_active || !state.activeLayout) {
            state.activeLayout = action.payload;
            // 同时更新其他布局的 is_active 状态
            state.layouts = state.layouts.map(layout => 
                layout.id === action.payload.id ? action.payload : { ...layout, is_active: false }
            );
        } else {
            // 确保新添加的非激活布局的 is_active 为 false
            const newLayout = { ...action.payload, is_active: false };
            state.layouts = state.layouts.map(layout => 
                layout.id === newLayout.id ? newLayout : layout
            );
        }
      })
      // updateLayout
      .addCase(updateLayout.fulfilled, (state, action: PayloadAction<Layout>) => {
        const index = state.layouts.findIndex(layout => layout.id === action.payload.id);
        if (index !== -1) {
          state.layouts[index] = action.payload;
        }
        if (state.activeLayout && state.activeLayout.id === action.payload.id) {
          state.activeLayout = action.payload;
        }
        // 如果更新的布局是激活的，确保其他布局的 is_active 为 false
        if (action.payload.is_active) {
            state.activeLayout = action.payload;
            state.layouts = state.layouts.map(layout =>
                layout.id === action.payload.id ? action.payload : { ...layout, is_active: false }
            );
        }
      })
      // activateLayout
      .addCase(activateLayout.fulfilled, (state, action: PayloadAction<Layout>) => {
        console.log('成功激活布局，更新 Redux 状态:', action.payload);
        // 设置活动布局
        state.activeLayout = action.payload;
        // 确保响应的布局数据完整性
        if (action.payload && action.payload.id) {
          // 更新布局列表中所有布局的激活状态
          state.layouts = state.layouts.map(layout =>
            layout.id === action.payload.id
              ? { ...action.payload, is_active: true } // 确保返回的布局 is_active 为 true
              : { ...layout, is_active: false }
          );
        } else {
          console.error('警告: 激活布局响应不完整:', action.payload);
        }
      })
      // updateLayoutSpacing
      .addCase(updateLayoutSpacing.fulfilled, (state, action: PayloadAction<Layout>) => {
        const index = state.layouts.findIndex(layout => layout.id === action.payload.id);
        if (index !== -1) {
          state.layouts[index] = action.payload;
        }
        if (state.activeLayout && state.activeLayout.id === action.payload.id) {
          state.activeLayout = action.payload;
        }
      })
      // deleteLayout
      .addCase(deleteLayout.fulfilled, (state, action: PayloadAction<number>) => {
        state.layouts = state.layouts.filter(layout => layout.id !== action.payload);
        if (state.activeLayout && state.activeLayout.id === action.payload) {
          // 如果删除的是当前激活的布局，尝试设置第一个布局为激活，或设为null
          state.activeLayout = state.layouts.length > 0 ? { ...state.layouts[0], is_active: true } : null;
          if (state.activeLayout) {
            // 如果成功设置了新的激活布局，需要调用 activateLayout 来通知后端
            // 注意：这里不能直接 dispatch，需要在组件中处理或通过其他方式触发
            // dispatch(activateLayout(state.activeLayout.id)); // 这是一个副作用，不应在 reducer 中
          }
        }
      });
  },
});

export const { resetLayoutStatus } = layoutSlice.actions;
export default layoutSlice.reducer;
