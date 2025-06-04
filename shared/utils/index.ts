// 共享的工具函数
// 这些函数可以在Web端和移动端之间复用

// 日期格式化函数
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return dateString;
  }
};

// 相对时间格式化
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) {
      return '刚刚';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return formatDate(dateString);
    }
  } catch (error) {
    return dateString;
  }
};

// 文件大小格式化
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// 图片尺寸格式化
export const formatImageDimensions = (width: number, height: number): string => {
  return `${width} × ${height}`;
};

// 生成缩略图URL
export const generateThumbnailUrl = (imageUrl: string, size = 300): string => {
  // 这里可以根据后端缩略图服务的实现来调整
  // 示例：添加查询参数来获取缩略图
  if (imageUrl.includes('?')) {
    return `${imageUrl}&thumbnail=${size}`;
  } else {
    return `${imageUrl}?thumbnail=${size}`;
  }
};

// 验证邮箱格式
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 验证用户名格式
export const validateUsername = (username: string): boolean => {
  // 用户名应该是3-20个字符，只包含字母、数字、下划线
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// 验证密码强度
export const validatePassword = (password: string): {
  isValid: boolean;
  message?: string;
} => {
  if (password.length < 8) {
    return { isValid: false, message: '密码至少需要8个字符' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: '密码需要包含至少一个小写字母' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: '密码需要包含至少一个大写字母' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: '密码需要包含至少一个数字' };
  }
  
  return { isValid: true };
};

// 去抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// 深拷贝函数
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  if (typeof obj === 'object') {
    const copy: any = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone((obj as any)[key]);
    });
    return copy;
  }
  
  return obj;
};

// 数组去重
export const uniqueArray = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const keyValue = item[key];
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
};

// 随机字符串生成
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 计算图片网格布局
export const calculateGridLayout = (
  containerWidth: number,
  numColumns: number,
  spacing: number,
  aspectRatio = 1
): {
  itemWidth: number;
  itemHeight: number;
  totalSpacing: number;
} => {
  const totalSpacing = spacing * (numColumns - 1);
  const itemWidth = (containerWidth - totalSpacing) / numColumns;
  const itemHeight = itemWidth / aspectRatio;
  
  return {
    itemWidth,
    itemHeight,
    totalSpacing,
  };
};

// 图片加载错误处理
export const getImagePlaceholder = (width: number, height: number): string => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">
        图片加载失败
      </text>
    </svg>
  `)}`;
};

// 安全的JSON解析
export const safeJsonParse = <T>(str: string, fallback: T): T => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

// 检查是否为空值
export const isEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// 格式化错误信息
export const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }
  
  if (error?.response?.data) {
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    
    // 处理字段错误
    if (typeof error.response.data === 'object') {
      const fieldErrors = Object.values(error.response.data)
        .flat()
        .filter(Boolean)
        .join(', ');
      if (fieldErrors) {
        return fieldErrors;
      }
    }
  }
  
  return '发生未知错误';
};
