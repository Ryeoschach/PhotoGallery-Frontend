import apiService from './apiService';
import type { Image, Group, ImageUpdateRequest, GroupCreateRequest, GroupUpdateRequest } from '../features/images/types';

/**
 * 图片服务 - 处理所有与图片相关的API请求
 */
const imageService = {
  /**
   * 获取所有图片
   * @param mine 是否只获取当前用户的图片
   * @returns 图片数组
   */
  getImages: (mine?: boolean): Promise<Image[]> => {
    const url = mine ? '/images/?mine=true' : '/images/';
    return apiService.get<Image[]>(url);
  },

  /**
   * 获取图片详情
   * @param id 图片ID
   * @returns 图片详情
   */
  getImageDetail: (id: number): Promise<Image> => {
    return apiService.get<Image>(`/images/${id}/`);
  },

  /**
   * 更新图片
   * @param data 图片更新数据
   * @returns 更新后的图片
   */
  updateImage: (data: ImageUpdateRequest): Promise<Image> => {
    return apiService.patch<Image>(`/images/${data.id}/`, data);
  },

  /**
   * 更新图片分组
   * @param imageId 图片ID
   * @param groupIds 分组ID数组
   * @returns 更新后的图片
   */
  updateImageGroups: (imageId: number, groupIds: number[]): Promise<Image> => {
    return apiService.patch<Image>(`/images/${imageId}/`, { groups: groupIds });
  },

  /**
   * 删除图片
   * @param id 图片ID
   * @returns void
   */
  deleteImage: (id: number): Promise<void> => {
    return apiService.delete<void>(`/images/${id}/`);
  },

  /**
   * 上传图片
   * @param formData 包含图片数据的FormData
   * @returns 上传后的图片
   */
  uploadImage: (formData: FormData): Promise<Image> => {
    return apiService.post<Image>('/images/', formData, {
      headers: {
        // 不设置Content-Type, 让浏览器自动设置为multipart/form-data
        'Content-Type': undefined
      }
    });
  }
};

/**
 * 分组服务 - 处理所有与分组相关的API请求
 */
const groupService = {
  /**
   * 获取所有分组
   * @returns 分组数组
   */
  getGroups: (): Promise<Group[]> => {
    return apiService.get<Group[]>('/groups/');
  },

  /**
   * 创建分组
   * @param data 分组创建数据
   * @returns 创建的分组
   */
  createGroup: (data: GroupCreateRequest): Promise<Group> => {
    return apiService.post<Group>('/groups/', data);
  },

  /**
   * 更新分组
   * @param data 分组更新数据
   * @returns 更新后的分组
   */
  updateGroup: (data: GroupUpdateRequest): Promise<Group> => {
    return apiService.patch<Group>(`/groups/${data.id}/`, {
      name: data.name,
      description: data.description
    });
  },

  /**
   * 删除分组
   * @param id 分组ID
   * @returns void
   */
  deleteGroup: (id: number): Promise<void> => {
    return apiService.delete<void>(`/groups/${id}/`);
  }
};

export { imageService, groupService };
