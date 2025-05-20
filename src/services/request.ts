import { extend } from 'umi-request';
import type { RequestMethod } from 'umi-request';

// 你可以在这里配置 umi-request 的全局设置，例如：
// - prefix: API 前缀 (如果 Vite 代理配置了 /api，这里可以不设置或设置为 /api)
// - errorHandler: 全局错误处理
// - headers: 全局请求头

// 示例：添加错误处理器
const errorHandler = (error: { response: Response, data?: any, request?: any }) => {
  const { response } = error;
  if (response && response.status) {
    const errorText = response.statusText;
    console.error(`请求错误 ${response.status}: ${response.url}`, errorText);
    // 你可以根据状态码做进一步处理，例如抛出特定错误或显示通知
  } else if (!response) {
    console.error('网络错误', error);
  }
  return response; // 或者 throw error;
};

// 扩展 RequestMethod 类型，使其包含 prefix 属性
interface ExtendedRequestMethod extends RequestMethod {
  prefix: string;
}

// 使用直接导入的 extend 函数创建请求实例
const extendRequest = extend({
  prefix: '/api', // 假设 Vite 代理配置了 /api 指向 http://127.0.0.1:8000
  errorHandler,
  // 添加默认请求头
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}) as ExtendedRequestMethod;

// 添加请求拦截器，自动为每个请求添加认证头
extendRequest.interceptors.request.use((url, options) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    // 确保headers存在
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    
    // 调试日志
    console.log(`Adding auth header to ${url}`, headers);
    
    return {
      url,
      options: { ...options, headers }
    };
  } else {
    console.log(`No token found for request to ${url}`);
  }
  
  return { url, options };
});

export default extendRequest;