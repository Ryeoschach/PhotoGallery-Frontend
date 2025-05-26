import { configureStore } from '@reduxjs/toolkit';
import imagesReducer from '../features/images/imagesSlice';
import authReducer from '../features/auth/authSlice';
import layoutReducer from '../features/layout/layoutSlice'; // 导入 layout reducer

export const store = configureStore({
  reducer: {
    images: imagesReducer,
    auth: authReducer,
    layouts: layoutReducer, // 添加 layout reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;