import apiClient from './request';
import { notification } from 'antd';

/**
 * 提取API响应中的数据
 * @param response API响应对象
 * @returns 处理后的响应数据
 */
export function extractData<T>(response: any): T {
  if (!response) return response;

  if (typeof response === 'object') {
    // 如果响应有data属性，返回data
    if ('data' in response) return response.data as T;
    
    // 如果响应本身就是数组，直接返回
    if (Array.isArray(response)) return response as unknown as T;
  }
  
  // 其他情况返回原始响应
  return response as T;
}

/**
 * 统一的API错误处理
 * @param error 错误对象
 * @param customMessage 自定义错误消息
 */
export const handleApiError = (error: any, customMessage?: string) => {
  console.error('API错误:', error);
  
  const message = customMessage || '操作失败';
  let description = '请稍后重试';
  
  if (error?.response) {
    const { status, statusText } = error.response;
    description = `${status} ${statusText}`;
    
    if (error.data?.message) {
      description = error.data.message;
    } else if (error.data?.detail) {
      description = error.data.detail;
    }
  } else if (error?.message) {
    description = error.message;
  }
  
  notification.error({
    message,
    description,
    duration: 5
  });
};

/**
 * 通用API服务
 */
const apiService = {
  /**
   * 发送GET请求
   * @param url 请求URL
   * @param options 请求选项
   * @returns 处理后的响应数据
   */
  async get<T>(url: string, options?: any): Promise<T> {
    try {
      const response = await apiClient.get(url, options);
      return extractData<T>(response);
    } catch (error) {
      handleApiError(error, `获取数据失败 (${url})`);
      throw error;
    }
  },

  /**
   * 发送POST请求
   * @param url 请求URL
   * @param data 请求数据
   * @param options 请求选项
   * @returns 处理后的响应数据
   */
  async post<T>(url: string, data: any, options?: any): Promise<T> {
    try {
      // 检查底层apiClient是否只接受2个参数
      // 如果是，需要将data和options合并
      if (options) {
        // 合并data和options为一个对象
        const requestOptions = {
          data,
          ...options
        };
        const response = await apiClient.post(url, requestOptions);
        return extractData<T>(response);
      } else {
        // 如果没有options，直接传入data
        const response = await apiClient.post(url, data);
        return extractData<T>(response);
      }
    } catch (error) {
      handleApiError(error, `创建数据失败 (${url})`);
      throw error;
    }
  },

  /**
   * 发送PUT请求
   * @param url 请求URL
   * @param data 请求数据
   * @param options 请求选项
   * @returns 处理后的响应数据
   */
  async put<T>(url: string, data: any, options?: any): Promise<T> {
    try {
      // 检查底层apiClient是否只接受2个参数
      // 如果是，需要将data和options合并
      if (options) {
        // 合并data和options为一个对象
        const requestOptions = {
          data,
          ...options
        };
        const response = await apiClient.put(url, requestOptions);
        return extractData<T>(response);
      } else {
        // 如果没有options，直接传入data
        const response = await apiClient.put(url, data);
        return extractData<T>(response);
      }
    } catch (error) {
      handleApiError(error, `更新数据失败 (${url})`);
      throw error;
    }
  },

  /**
   * 发送PATCH请求
   * @param url 请求URL
   * @param data 请求数据
   * @param options 请求选项
   * @returns 处理后的响应数据
   */
  async patch<T>(url: string, data: any, options?: any): Promise<T> {
    try {
      // 检查底层apiClient是否只接受2个参数
      // 如果是，需要将data和options合并
      if (options) {
        // 合并data和options为一个对象
        const requestOptions = {
          data,
          ...options
        };
        const response = await apiClient.patch(url, requestOptions);
        return extractData<T>(response);
      } else {
        // 如果没有options，直接传入data
        const response = await apiClient.patch(url, data);
        return extractData<T>(response);
      }
    } catch (error) {
      handleApiError(error, `更新数据失败 (${url})`);
      throw error;
    }
  },

  /**
   * 发送DELETE请求
   * @param url 请求URL
   * @param options 请求选项
   * @returns 处理后的响应数据
   */
  async delete<T>(url: string, options?: any): Promise<T> {
    try {
      const response = await apiClient.delete(url, options);
      return extractData<T>(response);
    } catch (error) {
      handleApiError(error, `删除数据失败 (${url})`);
      throw error;
    }
  }
};

export default apiService;
