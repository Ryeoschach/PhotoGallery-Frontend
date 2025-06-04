// 共享的API服务层
// 这个文件可以在Web端和移动端之间复用，只需要调整HTTP客户端

// API端点常量
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/token/',
    REFRESH: '/token/refresh/',
    REGISTER: '/register/',
    ME: '/me/',
  },
  
  // 用户管理
  USERS: {
    LIST: '/users/',
    DETAIL: (username: string) => `/users/${username}/`,
  },
  
  // 图片管理
  IMAGES: {
    LIST: '/images/',
    DETAIL: (id: number) => `/images/${id}/`,
    UPLOAD: '/images/',
    UPDATE: (id: number) => `/images/${id}/`,
    DELETE: (id: number) => `/images/${id}/`,
  },
  
  // 分组管理
  GROUPS: {
    LIST: '/groups/',
    DETAIL: (id: number) => `/groups/${id}/`,
    CREATE: '/groups/',
    UPDATE: (id: number) => `/groups/${id}/`,
    DELETE: (id: number) => `/groups/${id}/`,
  },
  
  // 布局管理
  LAYOUTS: {
    LIST: '/layouts/',
    ACTIVE: '/layouts/active/',
    DETAIL: (id: number) => `/layouts/${id}/`,
    CREATE: '/layouts/',
    UPDATE: (id: number) => `/layouts/${id}/`,
    DELETE: (id: number) => `/layouts/${id}/`,
    ACTIVATE: (id: number) => `/layouts/${id}/activate/`,
    UPDATE_SPACING: (id: number) => `/layouts/${id}/update_spacing/`,
  },
} as const;

// API服务类
export class ApiService {
  private client: any; // HTTP客户端，Web端用umi-request，移动端用axios
  
  constructor(httpClient: any) {
    this.client = httpClient;
  }
  
  // 认证API
  async login(credentials: { username: string; password: string }) {
    return this.client.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }
  
  async refreshToken(refreshToken: string) {
    return this.client.post(API_ENDPOINTS.AUTH.REFRESH, { refresh: refreshToken });
  }
  
  async register(userData: {
    username: string;
    password: string;
    password2: string;
    email: string;
    first_name: string;
    last_name: string;
  }) {
    return this.client.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  }
  
  async getCurrentUser() {
    return this.client.get(API_ENDPOINTS.AUTH.ME);
  }
  
  async updateUserProfile(userData: {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  }) {
    return this.client.patch(API_ENDPOINTS.AUTH.ME, userData);
  }
  
  // 用户管理API
  async getUsers() {
    return this.client.get(API_ENDPOINTS.USERS.LIST);
  }
  
  async getUserDetail(username: string) {
    return this.client.get(API_ENDPOINTS.USERS.DETAIL(username));
  }
  
  // 图片API
  async getImages(params?: { mine?: boolean }) {
    const queryString = params?.mine ? '?mine=true' : '';
    return this.client.get(`${API_ENDPOINTS.IMAGES.LIST}${queryString}`);
  }
  
  async getImageDetail(id: number) {
    return this.client.get(API_ENDPOINTS.IMAGES.DETAIL(id));
  }
  
  async uploadImage(formData: FormData | any) {
    // Web端使用FormData，移动端可能使用不同的格式
    return this.client.post(API_ENDPOINTS.IMAGES.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  
  async updateImage(id: number, data: { name?: string; description?: string }) {
    return this.client.patch(API_ENDPOINTS.IMAGES.UPDATE(id), data);
  }
  
  async deleteImage(id: number) {
    return this.client.delete(API_ENDPOINTS.IMAGES.DELETE(id));
  }
  
  async updateImageGroups(imageId: number, groupIds: number[]) {
    return this.client.patch(API_ENDPOINTS.IMAGES.UPDATE(imageId), {
      groups: groupIds,
    });
  }
  
  // 分组API
  async getGroups() {
    return this.client.get(API_ENDPOINTS.GROUPS.LIST);
  }
  
  async getGroupDetail(id: number) {
    return this.client.get(API_ENDPOINTS.GROUPS.DETAIL(id));
  }
  
  async createGroup(data: { name: string; description?: string }) {
    return this.client.post(API_ENDPOINTS.GROUPS.CREATE, data);
  }
  
  async updateGroup(id: number, data: { name?: string; description?: string }) {
    return this.client.patch(API_ENDPOINTS.GROUPS.UPDATE(id), data);
  }
  
  async deleteGroup(id: number) {
    return this.client.delete(API_ENDPOINTS.GROUPS.DELETE(id));
  }
  
  // 布局API
  async getLayouts() {
    return this.client.get(API_ENDPOINTS.LAYOUTS.LIST);
  }
  
  async getActiveLayout() {
    return this.client.get(API_ENDPOINTS.LAYOUTS.ACTIVE);
  }
  
  async getLayoutDetail(id: number) {
    return this.client.get(API_ENDPOINTS.LAYOUTS.DETAIL(id));
  }
  
  async createLayout(data: any) {
    return this.client.post(API_ENDPOINTS.LAYOUTS.CREATE, data);
  }
  
  async updateLayout(id: number, data: any) {
    return this.client.patch(API_ENDPOINTS.LAYOUTS.UPDATE(id), data);
  }
  
  async deleteLayout(id: number) {
    return this.client.delete(API_ENDPOINTS.LAYOUTS.DELETE(id));
  }
  
  async activateLayout(id: number) {
    return this.client.post(API_ENDPOINTS.LAYOUTS.ACTIVATE(id));
  }
  
  async updateLayoutSpacing(id: number, data: { image_spacing?: number; grid_padding?: number }) {
    return this.client.patch(API_ENDPOINTS.LAYOUTS.UPDATE_SPACING(id), data);
  }
}

// 错误处理工具函数
export const handleApiError = (error: any): string => {
  if (error.response?.data) {
    if (typeof error.response.data.detail === 'string') {
      return error.response.data.detail;
    }
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    if (typeof error.response.data === 'object') {
      const fieldErrors = Object.values(error.response.data).flat().join(' ');
      if (fieldErrors.trim()) {
        return fieldErrors;
      }
    }
  }
  
  if (error.message) {
    return error.message;
  }
  
  return '请求失败，请重试';
};

// 数据提取工具函数
export const extractResponseData = (response: any) => {
  // umi-request返回的直接是数据
  if (response && typeof response === 'object' && !response.data) {
    return response;
  }
  
  // axios返回的数据在data属性中
  if (response?.data) {
    return response.data;
  }
  
  return response;
};
