// 应用常量定义
// 这些常量可以在Web端和移动端之间复用

// API相关常量
export const API_CONFIG = {
  // 开发环境API地址
  DEV_BASE_URL: 'http://127.0.0.1:8000/api',
  
  // 生产环境API地址（需要根据实际部署调整）
  PROD_BASE_URL: 'https://your-api-domain.com/api',
  
  // 请求超时时间（毫秒）
  TIMEOUT: 30000,
  
  // 重试次数
  RETRY_ATTEMPTS: 3,
  
  // 分页大小
  PAGE_SIZE: 20,
} as const;

// 认证相关常量
export const AUTH_CONFIG = {
  // Token存储键名
  TOKEN_STORAGE_KEY: 'auth_token',
  REFRESH_TOKEN_STORAGE_KEY: 'refresh_token',
  
  // Token过期前多少秒开始刷新
  REFRESH_THRESHOLD: 300, // 5分钟
  
  // 登录页面路径
  LOGIN_PATH: '/login',
  
  // 默认登录后跳转路径
  DEFAULT_REDIRECT_PATH: '/',
} as const;

// 图片相关常量
export const IMAGE_CONFIG = {
  // 支持的图片格式
  SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'] as const,
  
  // 最大文件大小（字节）
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // 缩略图尺寸
  THUMBNAIL_SIZES: {
    SMALL: 150,
    MEDIUM: 300,
    LARGE: 600,
  },
  
  // 默认网格列数
  DEFAULT_GRID_COLUMNS: 3,
  
  // 最小/最大网格列数
  MIN_GRID_COLUMNS: 1,
  MAX_GRID_COLUMNS: 6,
  
  // 默认间距
  DEFAULT_SPACING: 8,
  
  // 图片质量
  QUALITY: {
    HIGH: 0.9,
    MEDIUM: 0.7,
    LOW: 0.5,
  },
} as const;

// 布局相关常量
export const LAYOUT_CONFIG = {
  // 默认布局配置
  DEFAULT_CONFIG: {
    columns: 3,
    featured_images: [],
    featured_groups: [],
    show_recent: true,
    recent_count: 6,
    image_spacing: 8,
    grid_padding: 16,
  },
  
  // 最小/最大值限制
  LIMITS: {
    MIN_COLUMNS: 1,
    MAX_COLUMNS: 6,
    MIN_RECENT_COUNT: 1,
    MAX_RECENT_COUNT: 20,
    MIN_SPACING: 0,
    MAX_SPACING: 32,
    MIN_PADDING: 0,
    MAX_PADDING: 64,
  },
} as const;

// UI相关常量
export const UI_CONFIG = {
  // 动画持续时间
  ANIMATION_DURATION: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500,
  },
  
  // 颜色主题
  COLORS: {
    PRIMARY: '#1890ff',
    SUCCESS: '#52c41a',
    WARNING: '#faad14',
    ERROR: '#ff4d4f',
    TEXT_PRIMARY: '#000000d9',
    TEXT_SECONDARY: '#00000073',
    TEXT_DISABLED: '#00000040',
    BORDER: '#d9d9d9',
    BACKGROUND: '#ffffff',
    BACKGROUND_LIGHT: '#fafafa',
  },
  
  // 间距规范
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },
  
  // 字体大小
  FONT_SIZES: {
    XS: 10,
    SM: 12,
    MD: 14,
    LG: 16,
    XL: 18,
    XXL: 20,
    XXXL: 24,
  },
  
  // 圆角
  BORDER_RADIUS: {
    SM: 4,
    MD: 6,
    LG: 8,
    XL: 12,
    ROUND: 50,
  },
  
  // 阴影
  SHADOWS: {
    LIGHT: '0 1px 3px rgba(0, 0, 0, 0.1)',
    MEDIUM: '0 4px 6px rgba(0, 0, 0, 0.1)',
    HEAVY: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
} as const;

// 移动端特有常量
export const MOBILE_CONFIG = {
  // 屏幕断点
  BREAKPOINTS: {
    PHONE: 768,
    TABLET: 1024,
  },
  
  // 触摸手势
  GESTURE: {
    TAP_SLOP: 10,
    LONG_PRESS_DELAY: 500,
    SWIPE_THRESHOLD: 100,
    SWIPE_VELOCITY: 0.3,
  },
  
  // 状态栏高度（需要动态获取）
  STATUS_BAR_HEIGHT: 44,
  
  // 导航栏高度
  NAVIGATION_BAR_HEIGHT: 64,
  
  // 底部导航高度
  TAB_BAR_HEIGHT: 80,
  
  // 安全区域内边距
  SAFE_AREA_PADDING: 16,
} as const;

// 缓存相关常量
export const CACHE_CONFIG = {
  // 缓存键名
  KEYS: {
    IMAGES: 'cached_images',
    GROUPS: 'cached_groups',
    USER_PREFERENCES: 'user_preferences',
    LAYOUT_SETTINGS: 'layout_settings',
  },
  
  // 缓存过期时间（毫秒）
  EXPIRY: {
    SHORT: 5 * 60 * 1000,     // 5分钟
    MEDIUM: 30 * 60 * 1000,   // 30分钟
    LONG: 24 * 60 * 60 * 1000, // 24小时
  },
  
  // 最大缓存大小
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

// 错误代码和消息
export const ERROR_CODES = {
  // 网络错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // 认证错误
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // 业务错误
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  
  // 客户端错误
  INVALID_DATA: 'INVALID_DATA',
  OPERATION_FAILED: 'OPERATION_FAILED',
} as const;

export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
  [ERROR_CODES.TIMEOUT]: '请求超时，请稍后重试',
  [ERROR_CODES.UNAUTHORIZED]: '请先登录',
  [ERROR_CODES.FORBIDDEN]: '没有权限执行此操作',
  [ERROR_CODES.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ERROR_CODES.VALIDATION_ERROR]: '输入数据验证失败',
  [ERROR_CODES.NOT_FOUND]: '请求的资源不存在',
  [ERROR_CODES.SERVER_ERROR]: '服务器错误，请稍后重试',
  [ERROR_CODES.INVALID_DATA]: '数据格式错误',
  [ERROR_CODES.OPERATION_FAILED]: '操作失败，请重试',
} as const;

// 应用信息
export const APP_INFO = {
  NAME: 'Photo Gallery',
  VERSION: '1.0.0',
  DESCRIPTION: '一个用于管理和分享照片的应用',
  AUTHOR: 'Your Name',
  CONTACT_EMAIL: 'contact@example.com',
  PRIVACY_POLICY_URL: 'https://example.com/privacy',
  TERMS_OF_SERVICE_URL: 'https://example.com/terms',
} as const;

// 功能开关
export const FEATURE_FLAGS = {
  // 是否启用图片上传
  ENABLE_IMAGE_UPLOAD: true,
  
  // 是否启用分组功能
  ENABLE_GROUPS: true,
  
  // 是否启用布局自定义
  ENABLE_LAYOUT_CUSTOMIZATION: true,
  
  // 是否启用离线模式
  ENABLE_OFFLINE_MODE: false,
  
  // 是否启用推送通知
  ENABLE_PUSH_NOTIFICATIONS: false,
  
  // 是否启用分享功能
  ENABLE_SHARING: true,
  
  // 是否启用暗色主题
  ENABLE_DARK_THEME: false,
} as const;
