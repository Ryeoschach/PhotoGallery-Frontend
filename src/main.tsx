import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import AppRouter from './router';
import 'antd/dist/reset.css'; // 引入 Ant Design 的重置样式
import './index.css'; // 全局样式
import './App.css'; // App 相关样式

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRouter />
    </Provider>
  </React.StrictMode>
);
