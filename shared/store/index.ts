// 共享的Redux Store配置
// 这个文件可以在Web端和移动端之间复用

import { configureStore } from '@reduxjs/toolkit';
import type { Action, ThunkAction } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import imagesReducer from './slices/imagesSlice';
import layoutReducer from './slices/layoutSlice';

// 基础store配置（不包含持久化）
export const createStore = (additionalReducers = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      images: imagesReducer,
      layouts: layoutReducer,
      ...additionalReducers,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // 忽略持久化相关的action
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
  });
};

// 基础类型定义
export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>;
export type AppDispatch = ReturnType<typeof createStore>['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// 默认store（用于Web端）
export const store = createStore();

// 用于移动端的store创建函数（支持持久化）
export const createMobileStore = (persistConfig?: any) => {
  // 这里会在移动端项目中实现持久化逻辑
  return createStore();
};
