/**
 * 登录错误处理测试
 * 验证新的错误处理系统是否正常工作
 */

import { describe, it, expect } from 'vitest';
import { parseLoginError, validateLoginForm, shouldShowRetryButton } from '../src/utils/errorHandling';

describe('登录错误处理', () => {
  describe('parseLoginError', () => {
    it('应该正确解析网络错误', () => {
      const networkError = {
        message: 'Network request failed'
      };
      
      const result = parseLoginError(networkError);
      
      expect(result.type).toBe('network');
      expect(result.message).toBe('网络连接失败，请检查网络设置后重试');
      expect(result.retryable).toBe(true);
    });

    it('应该正确解析401认证错误', () => {
      const authError = {
        response: {
          status: 401,
          data: {
            detail: '用户名或密码错误'
          }
        },
        status: 401
      };
      
      const result = parseLoginError(authError);
      
      expect(result.type).toBe('authentication');
      expect(result.message).toBe('用户名或密码错误');
      expect(result.retryable).toBe(false);
    });

    it('应该正确解析400字段验证错误', () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            username: ['用户名不能为空']
          }
        },
        status: 400
      };
      
      const result = parseLoginError(validationError);
      
      expect(result.type).toBe('validation');
      expect(result.message).toBe('用户名不能为空');
      expect(result.retryable).toBe(false);
      expect(result.inputField).toBe('username');
    });

    it('应该正确解析服务器错误', () => {
      const serverError = {
        response: {
          status: 500,
          data: {}
        },
        status: 500
      };
      
      const result = parseLoginError(serverError);
      
      expect(result.type).toBe('server');
      expect(result.message).toBe('服务器临时不可用，请稍后重试');
      expect(result.retryable).toBe(true);
    });

    it('应该正确解析未知错误', () => {
      const unknownError = {
        message: '未知错误'
      };
      
      const result = parseLoginError(unknownError);
      
      expect(result.type).toBe('unknown');
      expect(result.retryable).toBe(true);
    });
  });

  describe('validateLoginForm', () => {
    it('应该验证有效的登录表单', () => {
      const result = validateLoginForm('testuser', 'password123');
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('应该检测空用户名', () => {
      const result = validateLoginForm('', 'password123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBe('请输入用户名');
    });

    it('应该检测用户名过短', () => {
      const result = validateLoginForm('ab', 'password123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBe('用户名至少需要3个字符');
    });

    it('应该检测空密码', () => {
      const result = validateLoginForm('testuser', '');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('请输入密码');
    });

    it('应该检测密码过短', () => {
      const result = validateLoginForm('testuser', '12345');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('密码至少需要6个字符');
    });
  });

  describe('shouldShowRetryButton', () => {
    it('网络错误应该显示重试按钮', () => {
      expect(shouldShowRetryButton('network')).toBe(true);
    });

    it('服务器错误应该显示重试按钮', () => {
      expect(shouldShowRetryButton('server')).toBe(true);
    });

    it('未知错误应该显示重试按钮', () => {
      expect(shouldShowRetryButton('unknown')).toBe(true);
    });

    it('验证错误不应该显示重试按钮', () => {
      expect(shouldShowRetryButton('validation')).toBe(false);
    });

    it('认证错误不应该显示重试按钮', () => {
      expect(shouldShowRetryButton('authentication')).toBe(false);
    });
  });
});
