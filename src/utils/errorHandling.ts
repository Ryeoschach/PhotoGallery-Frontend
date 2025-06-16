/**
 * 错误处理工具函数
 * 用于处理和分类不同类型的登录错误
 */

export interface LoginError {
  type: 'network' | 'validation' | 'authentication' | 'server' | 'unknown';
  message: string;
  originalError?: any;
  retryable: boolean;
  inputField?: 'username' | 'password' | null;
}

/**
 * 解析登录错误并返回用户友好的错误信息
 */
export const parseLoginError = (error: any): LoginError => {
  // 网络错误 - 连接失败
  if (!error.response && (error.message?.includes('Network') || error.message?.includes('fetch'))) {
    return {
      type: 'network',
      message: '网络连接失败，请检查网络设置后重试',
      originalError: error,
      retryable: true,
    };
  }

  // 如果有响应，根据HTTP状态码分类
  const status = error.response?.status || error.status;
  const errorData = error.response?.data || {};

  switch (status) {
    case 400:
      // 检查具体的字段错误
      if (errorData.username) {
        return {
          type: 'validation',
          message: Array.isArray(errorData.username) 
            ? errorData.username.join(', ') 
            : errorData.username,
          originalError: error,
          retryable: false,
          inputField: 'username',
        };
      }
      
      if (errorData.password) {
        return {
          type: 'validation',
          message: Array.isArray(errorData.password) 
            ? errorData.password.join(', ') 
            : errorData.password,
          originalError: error,
          retryable: false,
          inputField: 'password',
        };
      }

      return {
        type: 'validation',
        message: errorData.detail || '输入信息格式不正确，请检查后重试',
        originalError: error,
        retryable: false,
      };

    case 401:
      return {
        type: 'authentication',
        message: errorData.detail || '用户名或密码错误，请重新输入',
        originalError: error,
        retryable: false,
      };

    case 403:
      return {
        type: 'authentication',
        message: '账户被禁用或权限不足，请联系管理员',
        originalError: error,
        retryable: false,
      };

    case 429:
      return {
        type: 'server',
        message: '登录尝试过于频繁，请稍后再试',
        originalError: error,
        retryable: true,
      };

    case 500:
    case 502:
    case 503:
    case 504:
      return {
        type: 'server',
        message: '服务器临时不可用，请稍后重试',
        originalError: error,
        retryable: true,
      };

    default:
      // 检查具体错误消息
      const errorMessage = errorData.detail || error.message || '';
      
      if (errorMessage.includes('用户名') || errorMessage.includes('username')) {
        return {
          type: 'validation',
          message: '用户名不存在，请检查用户名是否正确',
          originalError: error,
          retryable: false,
          inputField: 'username',
        };
      }
      
      if (errorMessage.includes('密码') || errorMessage.includes('password')) {
        return {
          type: 'authentication',
          message: '密码错误，请重新输入正确的密码',
          originalError: error,
          retryable: false,
          inputField: 'password',
        };
      }
      
      if (errorMessage.includes('超时') || errorMessage.includes('timeout')) {
        return {
          type: 'network',
          message: '连接超时，请检查网络后重试',
          originalError: error,
          retryable: true,
        };
      }

      return {
        type: 'unknown',
        message: errorMessage || '登录失败，请重试',
        originalError: error,
        retryable: true,
      };
  }
};

/**
 * 根据错误类型获取重试建议
 */
export const getRetryAdvice = (errorType: LoginError['type']): string => {
  switch (errorType) {
    case 'network':
      return '请检查网络连接';
    case 'validation':
      return '请检查输入信息';
    case 'authentication':
      return '请确认用户名和密码';
    case 'server':
      return '请稍后重试';
    default:
      return '请重试';
  }
};

/**
 * 检查错误是否应该显示重试按钮
 */
export const shouldShowRetryButton = (errorType: LoginError['type']): boolean => {
  return ['network', 'server', 'unknown'].includes(errorType);
};

/**
 * 获取错误图标
 */
export const getErrorIcon = (errorType: LoginError['type']): string => {
  switch (errorType) {
    case 'network':
      return '🌐';
    case 'validation':
      return '⚠️';
    case 'authentication':
      return '🔐';
    case 'server':
      return '🔧';
    default:
      return '❌';
  }
};

/**
 * 表单输入验证
 */
export interface ValidationResult {
  isValid: boolean;
  errors: {
    username?: string;
    password?: string;
  };
}

export const validateLoginForm = (username: string, password: string): ValidationResult => {
  const errors: ValidationResult['errors'] = {};

  // 用户名验证
  if (!username.trim()) {
    errors.username = '请输入用户名';
  } else if (username.length < 3) {
    errors.username = '用户名至少需要3个字符';
  } else if (username.length > 150) {
    errors.username = '用户名不能超过150个字符';
  }

  // 密码验证
  if (!password) {
    errors.password = '请输入密码';
  } else if (password.length < 6) {
    errors.password = '密码至少需要6个字符';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
