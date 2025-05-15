import { configureStore } from '@reduxjs/toolkit';
import usersReducer from '../features/users/usersSlice';
import imagesReducer from '../features/images/imagesSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    images: imagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;