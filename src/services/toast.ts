/**
 * Toast通知组件
 * 基于Ant Design的notification系统
 */

import { notification } from 'antd';
import type { NotificationArgsProps } from 'antd';
import type { LoginError } from '../utils/errorHandling';
import { getErrorIcon } from '../utils/errorHandling';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  placement?: NotificationArgsProps['placement'];
  className?: string;
}

class ToastService {
  private defaultOptions: ToastOptions = {
    duration: 4.5,
    placement: 'topRight',
  };

  /**
   * 显示成功消息
   */
  success(message: string, description?: string, options?: ToastOptions) {
    notification.success({
      message: `✅ ${message}`,
      description,
      ...this.defaultOptions,
      ...options,
    });
  }

  /**
   * 显示错误消息
   */
  error(message: string, description?: string, options?: ToastOptions) {
    notification.error({
      message: `❌ ${message}`,
      description,
      ...this.defaultOptions,
      ...options,
      duration: options?.duration ?? 6, // 错误消息显示更长时间
    });
  }

  /**
   * 显示警告消息
   */
  warning(message: string, description?: string, options?: ToastOptions) {
    notification.warning({
      message: `⚠️ ${message}`,
      description,
      ...this.defaultOptions,
      ...options,
    });
  }

  /**
   * 显示信息消息
   */
  info(message: string, description?: string, options?: ToastOptions) {
    notification.info({
      message: `ℹ️ ${message}`,
      description,
      ...this.defaultOptions,
      ...options,
    });
  }

  /**
   * 基于登录错误显示Toast通知
   */
  showLoginError(error: LoginError, options?: ToastOptions) {
    const icon = getErrorIcon(error.type);
    const message = `${icon} 登录失败`;
    
    switch (error.type) {
      case 'network':
        this.error(message, error.message, {
          ...options,
          duration: 6,
        });
        break;
        
      case 'validation':
        this.warning(message, error.message, {
          ...options,
          duration: 5,
        });
        break;
        
      case 'authentication':
        this.error(message, error.message, {
          ...options,
          duration: 5,
        });
        break;
        
      case 'server':
        this.warning(message, error.message, {
          ...options,
          duration: 6,
        });
        break;
        
      default:
        this.error(message, error.message, options);
        break;
    }
  }

  /**
   * 显示登录成功消息
   */
  showLoginSuccess(username?: string) {
    this.success(
      '登录成功！',
      username ? `欢迎回来，${username}！` : '欢迎使用照片库系统',
      { duration: 3 }
    );
  }

  /**
   * 清除所有通知
   */
  clear() {
    notification.destroy();
  }

  /**
   * 配置全局默认选项
   */
  configure(options: ToastOptions) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
    
    // 配置Ant Design notification的全局样式
    notification.config({
      placement: options.placement || 'topRight',
      duration: options.duration || 4.5,
      maxCount: 3, // 最多同时显示3个通知
    });
  }
}

// 导出单例实例
export const toast = new ToastService();

// 初始化配置
toast.configure({
  placement: 'topRight',
  duration: 4.5,
});

export default toast;
