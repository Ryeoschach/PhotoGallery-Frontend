import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import apiClient from '../../services/request';

// 照片数据的接口
export interface Image {
  id: number;
  name: string;
  description: string | null;
  image: string; // URL 地址
  uploaded_at: string;
  updated_at: string;
  user: number; // 用户 ID
  width: number;  // 添加这些字段
  height: number;
  size: number;
  owner: string | number | null; // 添加 owner 属性，可以是字符串、数字或 null
  thumbnail?: string; // 缩略图 URL
  groups: number[]; // 组 ID 数组
  // 根据实际 API 返回添加其他字段
}

// 在接口部分添加分组相关的接口
export interface Group {
  id: number;
  name: string;
  description: string | null;
}

export interface GroupCreateRequest {
  name: string;
  description: string;
}

export interface GroupUpdateRequest {
  id: number;
  name: string;
  description: string;
}

// 编辑照片的请求数据接口
export interface ImageUpdateRequest {
  id: number;
  name?: string;
  description?: string;
}

// 上传照片的请求数据接口
export interface ImageUploadRequest {
  name: string;
  description: string;
  image: File;
  groups?: number[]; // 添加可选的分组 ID 数组
}

// Slice 的状态接口
interface ImagesState {
  list: Image[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
  // 单张照片详情相关状态
  currentImage: Image | null;
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  detailError: string | null | undefined;
  // 上传状态
  uploadStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  uploadError: string | null | undefined;
  // 更新状态
  updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  updateError: string | null | undefined;
  // 删除状态
  deleteStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  deleteError: string | null | undefined;
  // 选中的照片（用于批量删除）
  selectedImageIds: number[];
  
  // 添加分组相关状态
  groups: Group[];
  groupsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  groupsError: string | null | undefined;
  
  // 当前选中的分组 ID（用于过滤）
  selectedGroupId: number | null;
}

// 初始状态
const initialState: ImagesState = {
  list: [],
  status: 'idle',
  error: null,
  currentImage: null,
  detailStatus: 'idle',
  detailError: null,
  uploadStatus: 'idle',
  uploadError: null,
  updateStatus: 'idle',
  updateError: null,
  deleteStatus: 'idle',
  deleteError: null,
  selectedImageIds: [],
  
  // 添加分组初始状态
  groups: [],
  groupsStatus: 'idle',
  groupsError: null,
  selectedGroupId: null,
};

// 修改 fetchImages 函数 - 修复参数顺序问题
export const fetchImages = createAsyncThunk(
  'images/fetchImages',
  async (params?: { mine?: boolean }) => {
    // 构建请求URL，如果指定了 mine 参数则请求用户自己的照片
    const url = '/images/' + (params?.mine ? '?mine=true' : '');
    
    console.log('Fetching images with URL:', url, '当前时间:', new Date().toISOString());
    const response = await apiClient.get(url);
    console.log('API response for images:', response);
    
    // 检查响应的结构，提取正确的数据部分
    if (response && typeof response === 'object') {
      // 如果 response 是对象且有 data 属性
      if ('data' in response) return response.data;
      
      // 如果 response 本身就是一个数组，那可能它就是我们需要的数据
      if (Array.isArray(response)) return response;
    }
    
    // 默认返回响应
    return response;
  }
);

// 获取单张照片详情
export const fetchImageDetail = createAsyncThunk(
  'images/fetchImageDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      // 打印请求详情
      const requestUrl = `/images/${id}/`;
      console.log(`🚀 开始请求图片详情，ID: ${id}，完整URL: ${apiClient.prefix + requestUrl}`);
      
      const response = await apiClient.get(requestUrl, {
        headers: {
          'Accept': 'application/json', // 明确请求JSON数据
        },
        getResponse: true, // 获取完整响应以检查状态码和内容类型
      });
      
      console.log('🔍 API response for image detail:', response);
      
      // 检查响应状态和内容类型
      if (response.response) {
        console.log(`⚠️ 响应状态: ${response.response.status} ${response.response.statusText}`);
        if (response.response.headers) {
          const contentType = response.response.headers.get('content-type');
          console.log(`📋 响应Content-Type: ${contentType}`);
          if (contentType && !contentType.includes('application/json')) {
            console.error('⛔ Expected JSON but got:', contentType);
            return rejectWithValue(`服务器返回了非JSON数据(${contentType})，请检查API是否正确`);
          }
        }
      }
      
      // 提取数据部分
      const data = response.data || response;
      console.log('📦 提取的数据部分:', data);
      
      // 检查响应的结构，提取正确的数据部分
      if (data && typeof data === 'object') {
        // 如果 data 有 data 属性
        if ('data' in data) {
          console.log('✅ 找到data属性，内容:', data.data);
          return data.data;
        }
        
        // 如果 data 本身就是包含需要的字段的对象，直接返回
        if ('id' in data && 'name' in data && 'image' in data) {
          console.log('✅ 找到有效的图片对象:', { id: data.id, name: data.name });
          return data;
        }
        
        // 详细记录对象结构
        console.error('❌ 响应对象缺少必要属性，对象结构:', Object.keys(data));
      } else {
        console.error('❌ 数据部分不是有效对象:', typeof data);
      }
      
      // 如果找不到有效数据，拒绝请求
      return rejectWithValue('无法从响应中提取有效的图片数据');
    } catch (error: any) {
      console.error('Error fetching image detail:', error);
      return rejectWithValue(error.message || '获取图片详情失败');
    }
  }
);

// 上传新照片 - 使用更明确的文件上传逻辑
export const uploadImage = createAsyncThunk<Image, ImageUploadRequest>(
  'images/uploadImage',
  async (imageData: ImageUploadRequest) => {
    try {
      console.log('开始上传图片，准备FormData'); 
      
      // 检查文件对象是否存在
      if (!imageData.image) {
        throw new Error('没有找到有效的文件对象');
      }
      
      console.log('文件对象信息:', {
        name: imageData.image.name,
        type: imageData.image.type,
        size: imageData.image.size,
        lastModified: new Date(imageData.image.lastModified).toISOString()
      });
      
      const formData = new FormData();
      
      // 直接添加文件对象，不指定第三个参数
      formData.append('image', imageData.image);
      formData.append('name', imageData.name);
      formData.append('description', imageData.description || '');
      
      if (imageData.groups && imageData.groups.length > 0) {
        imageData.groups.forEach(groupId => {
          formData.append('groups', groupId.toString());
        });
      }

      // 打印FormData内容，验证数据正确性
      console.log('FormData内容:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? `文件 - ${value.name} (${value.type}, ${value.size} bytes)` : value}`);
      }

      // 直接使用fetch API发送请求
      const token = localStorage.getItem('token');
      const apiBaseUrl = '/api'; // 与apiClient.prefix一致
      
      console.log(`发送上传请求到 ${apiBaseUrl}/images/`);
      const response = await fetch(`${apiBaseUrl}/images/`, {
        method: 'POST',
        headers: {
          // 重要：不要自己设置Content-Type，让浏览器设置正确的multipart/form-data和boundary
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formData
      });
      
      console.log(`上传响应状态: ${response.status} ${response.statusText}`);
      
      // 打印整个响应头信息，帮助调试
      console.log('响应头信息:');
      response.headers.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      
      if (!response.ok) {
        let errorMessage = `上传失败: ${response.status} ${response.statusText}`;
        try {
          // 尝试解析JSON错误消息
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json();
            console.error('上传失败 (JSON错误):', errorJson);
            
            // 处理不同的错误响应格式
            if (errorJson.detail) {
              errorMessage += ` - ${errorJson.detail}`;
            } else if (errorJson.message) {
              errorMessage += ` - ${errorJson.message}`;
            } else if (errorJson.error) {
              errorMessage += ` - ${errorJson.error}`;
            } else {
              // 如果没有特定错误字段，转换整个对象
              errorMessage += ` - ${JSON.stringify(errorJson)}`;
            }
          } else {
            // 非JSON错误响应
            const errorText = await response.text();
            console.error('上传失败 (文本错误):', errorText);
            errorMessage += errorText ? ` - ${errorText}` : '';
          }
        } catch (parseError) {
          console.error('解析错误响应时出错:', parseError);
          const errorText = await response.text().catch(() => '');
          errorMessage += errorText ? ` - ${errorText}` : '';
        }
        
        throw new Error(errorMessage);
      }
      
      try {
        const data = await response.json();
        console.log('上传成功，服务器返回:', data);
        
        // 验证返回的数据
        if (!data || typeof data !== 'object') {
          console.error('服务器返回了无效数据:', data);
          throw new Error('服务器返回的数据无效');
        }
        
        return data as Image;
      } catch (error) {
        console.error('解析响应数据时出错:', error);
        throw new Error('解析服务器响应失败，但图片可能已成功上传');
      }
    } catch (error) {
      console.error('上传过程中发生错误:', error);
      throw error;
    }
  }
);

// 修改 updateImage 函数
export const updateImage = createAsyncThunk<Image, ImageUpdateRequest>(
  'images/updateImage',
  async (imageData: ImageUpdateRequest) => {
    const { id, ...updateData } = imageData;
    
    console.log('Updating image with data:', updateData); 
    
    const response = await apiClient.patch(`/images/${id}/`, {
      data: updateData,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Update response:', response);
    
    // 检查响应的结构，提取正确的数据部分
    if (response && typeof response === 'object') {
      // 如果 response 是对象且有 data 属性
      if ('data' in response) return response.data as Image;
      
      // 如果 response 本身就是包含需要的字段的对象，直接返回
      if ('id' in response && 'name' in response && 'image' in response) return response as Image;
    }
    
    // 默认返回响应
    return response as Image;
  }
);

// 删除照片
export const deleteImage = createAsyncThunk(
  'images/deleteImage',
  async (id: number) => {
    await apiClient.delete(`/images/${id}/`);
    return id; // 返回 ID 用于从状态中移除该照片
  }
);

// 批量删除照片（逐个删除）
export const bulkDeleteImages = createAsyncThunk(
  'images/bulkDeleteImages',
  async (ids: number[], { dispatch }) => {
    // 逐个删除每张照片
    const promises = ids.map(id => dispatch(deleteImage(id)));
    await Promise.all(promises);
    return ids;
  }
);

// 获取所有分组
export const fetchGroups = createAsyncThunk(
  'images/fetchGroups',
  async () => {
    const response = await apiClient.get('/groups/');
    console.log('API response for groups:', response);
    
    // 检查响应的结构，提取正确的数据部分
    if (response && typeof response === 'object') {
      // 如果 response 是对象且有 data 属性
      if ('data' in response) return response.data;
      
      // 如果 response 本身就是一个数组，那可能它就是我们需要的数据
      if (Array.isArray(response)) return response;
    }
    
    // 默认返回响应
    return response;
  }
);

// 创建分组
export const createGroup = createAsyncThunk(
  'images/createGroup',
  async (groupData: GroupCreateRequest) => {
    const response = await apiClient.post('/groups/', {
      data: groupData,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Create group response:', response);
    
    // 检查响应的结构，提取正确的数据部分
    if (response && typeof response === 'object') {
      // 如果 response 是对象且有 data 属性
      if ('data' in response) return response.data;
      
      // 如果 response 本身就是包含需要的字段的对象，直接返回
      if ('id' in response && 'name' in response) return response;
    }
    
    return response;
  }
);

// 更新分组
export const updateGroup = createAsyncThunk(
  'images/updateGroup',
  async (groupData: GroupUpdateRequest) => {
    // 修复：将数据和headers合并到options对象中
    const response = await apiClient.patch(`/groups/${groupData.id}/`, {
      data: {  // 将数据放在data属性中
        name: groupData.name,
        description: groupData.description
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Update group response:', response);
    
    // 检查响应的结构，提取正确的数据部分
    if (response && typeof response === 'object') {
      // 如果 response 是对象且有 data 属性
      if ('data' in response) return response.data;
      
      // 如果 response 本身就是包含需要的字段的对象，直接返回
      if ('id' in response && 'name' in response) return response;
    }
    
    return response;
  }
);

// 删除分组
export const deleteGroup = createAsyncThunk(
  'images/deleteGroup',
  async (groupId: number) => {
    await apiClient.delete(`/groups/${groupId}/`);
    return groupId;
  }
);

// 更新照片的分组
export const updateImageGroups = createAsyncThunk<Image, { imageId: number, groupIds: number[] }>(
  'images/updateImageGroups',
  async ({ imageId, groupIds }) => {
    console.log(`Updating image ${imageId} with groups:`, groupIds);
    const response = await apiClient.patch(`/images/${imageId}/`, {
      data: { groups: groupIds },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Update groups response:', response); // 调试日志
    
    // 检查响应的结构，提取正确的数据部分
    if (response && typeof response === 'object') {
      // 如果 response 是对象且有 data 属性
      if ('data' in response) return response.data as Image;
      
      // 如果 response 本身就是包含需要的字段的对象，直接返回
      if ('id' in response && 'name' in response && 'image' in response) return response as Image;
    }
    
    return response as Image;
  }
);

// 创建 Slice
const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    // 清除当前照片详情
    clearCurrentImage: (state) => {
      state.currentImage = null;
      state.detailStatus = 'idle';
      state.detailError = null;
    },
    // 重置上传状态
    resetUploadStatus: (state) => {
      state.uploadStatus = 'idle';
      state.uploadError = null;
    },
    // 重置更新状态
    resetUpdateStatus: (state) => {
      state.updateStatus = 'idle';
      state.updateError = null;
    },
    // 重置删除状态
    resetDeleteStatus: (state) => {
      state.deleteStatus = 'idle';
      state.deleteError = null;
    },
    // 切换照片选中状态
    toggleImageSelection: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const index = state.selectedImageIds.indexOf(id);
      if (index === -1) {
        state.selectedImageIds.push(id);
      } else {
        state.selectedImageIds.splice(index, 1);
      }
    },
    // 清除所有选中的照片
    clearSelectedImages: (state) => {
      state.selectedImageIds = [];
    },
    // 全选照片
    selectAllImages: (state) => {
      state.selectedImageIds = state.list.map(image => image.id);
    },
    // 设置选中的分组 ID（用于过滤照片）
    setSelectedGroup: (state, action: PayloadAction<number | null>) => {
      state.selectedGroupId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取照片列表
      .addCase(fetchImages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        // 清空当前列表，避免在页面间切换时显示旧数据
        state.list = [];
      })
      .addCase(fetchImages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // 确保action.payload是一个数组
        if (Array.isArray(action.payload)) {
          state.list = action.payload as Image[];
        } else {
          console.error('Fetch images succeeded but returned invalid data:', action.payload);
          state.list = [];
        }
      })
      .addCase(fetchImages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      // 获取照片详情
      .addCase(fetchImageDetail.pending, (state) => {
        state.detailStatus = 'loading';
        state.detailError = null;
      })
      .addCase(fetchImageDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        // 确保action.payload是一个有效的Image对象
        if (action.payload && typeof action.payload === 'object' && 'id' in action.payload) {
          state.currentImage = action.payload as Image;
        } else {
          console.error('Fetch image detail succeeded but returned invalid data:', action.payload);
          state.detailStatus = 'failed';
          state.detailError = '获取图片详情失败：无效的响应数据';
        }
      })
      .addCase(fetchImageDetail.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.detailError = action.error.message;
      })
      
      // 上传照片
      .addCase(uploadImage.pending, (state) => {
        state.uploadStatus = 'loading';
        state.uploadError = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        // 从 action.payload 中提取图片数据并添加到列表中
        // 确保action.payload是一个有效的Image对象
        if (action.payload && typeof action.payload === 'object' && 'id' in action.payload) {
          // 确保不重复添加
          if (!state.list.some(img => img.id === action.payload.id)) {
            console.log('添加新上传的照片到列表中:', action.payload);
            state.list.unshift(action.payload as Image); // 添加到列表开头，让新照片显示在前面
          }
        } else {
          console.error('Upload succeeded but returned invalid image data:', action.payload);
        }
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.uploadError = action.error.message;
      })
      
      // 更新照片
      .addCase(updateImage.pending, (state) => {
        state.updateStatus = 'loading';
        state.updateError = null;
      })
      .addCase(updateImage.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        
        // 确保action.payload是一个有效的Image对象
        if (action.payload && typeof action.payload === 'object' && 'id' in action.payload) {
          const updatedImage = action.payload as Image;
          
          // 更新列表中的照片
          const index = state.list.findIndex(img => img.id === updatedImage.id);
          if (index !== -1) {
            state.list[index] = updatedImage;
          }
          
          // 如果当前正在查看的是这张照片，也更新它
          if (state.currentImage && state.currentImage.id === updatedImage.id) {
            state.currentImage = updatedImage;
          }
        } else {
          console.error('Update image succeeded but returned invalid data:', action.payload);
        }
      })
      .addCase(updateImage.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.error.message;
      })
      
      // 删除照片
      .addCase(deleteImage.pending, (state) => {
        state.deleteStatus = 'loading';
        state.deleteError = null;
      })
      .addCase(deleteImage.fulfilled, (state, action: PayloadAction<number>) => {
        state.deleteStatus = 'succeeded';
        // 从列表中移除已删除的照片
        state.list = state.list.filter(img => img.id !== action.payload);
        // 从选中列表中移除已删除的照片
        state.selectedImageIds = state.selectedImageIds.filter(id => id !== action.payload);
        // 如果当前查看的照片被删除，清除它
        if (state.currentImage && state.currentImage.id === action.payload) {
          state.currentImage = null;
        }
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.deleteError = action.error.message;
      })
      
      // 获取分组列表
      .addCase(fetchGroups.pending, (state) => {
        state.groupsStatus = 'loading';
        state.groupsError = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.groupsStatus = 'succeeded';
        // 确保action.payload是一个数组
        if (Array.isArray(action.payload)) {
          state.groups = action.payload as Group[];
        } else {
          console.error('Fetch groups succeeded but returned invalid data:', action.payload);
          state.groups = [];
        }
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.groupsStatus = 'failed';
        state.groupsError = action.error.message;
      })
      
      // 创建分组
      .addCase(createGroup.fulfilled, (state, action) => {
        // 确保action.payload是一个有效的Group对象
        if (action.payload && typeof action.payload === 'object' && 'id' in action.payload && 'name' in action.payload) {
          state.groups.push(action.payload as Group);
        } else {
          console.error('Create group succeeded but returned invalid data:', action.payload);
        }
      })
      
      // 更新分组
      .addCase(updateGroup.fulfilled, (state, action) => {
        // 确保action.payload是一个有效的Group对象
        if (action.payload && typeof action.payload === 'object' && 'id' in action.payload && 'name' in action.payload) {
          const updatedGroup = action.payload as Group;
          const index = state.groups.findIndex(group => group.id === updatedGroup.id);
          if (index !== -1) {
            state.groups[index] = updatedGroup;
          }
        } else {
          console.error('Update group succeeded but returned invalid data:', action.payload);
        }
      })
      
      // 删除分组
      .addCase(deleteGroup.fulfilled, (state, action: PayloadAction<number>) => {
        state.groups = state.groups.filter(group => group.id !== action.payload);
        if (state.selectedGroupId === action.payload) {
          state.selectedGroupId = null;
        }
      })
      
      // 更新照片分组
      .addCase(updateImageGroups.fulfilled, (state, action) => { 
        // 确保action.payload是一个有效的Image对象
        if (action.payload && typeof action.payload === 'object' && 'id' in action.payload) {
          const updatedImage = action.payload as Image;
          console.log('Updated image in reducer:', updatedImage);
          
          // 更新列表中的照片
          const index = state.list.findIndex(img => img.id === updatedImage.id);
          if (index !== -1) {
            state.list[index] = updatedImage;
          }
          
          // 如果当前正在查看的是这张照片，也更新它
          if (state.currentImage && state.currentImage.id === updatedImage.id) {
            state.currentImage = updatedImage;
          }
        } else {
          console.error('Update image groups succeeded but returned invalid data:', action.payload);
        }
      });
  },
});

// 导出 actions
export const { 
  clearCurrentImage, 
  resetUploadStatus, 
  resetUpdateStatus, 
  resetDeleteStatus,
  toggleImageSelection,
  clearSelectedImages,
  selectAllImages: selectAllImagesAction,
  setSelectedGroup,
} = imagesSlice.actions;

// 导出 reducer
export default imagesSlice.reducer;

// 导出 selectors
export const selectAllImages = (state: RootState) => state.images.list;
export const selectFilteredImages = createSelector(
  [(state: RootState) => state.images.list,
   (state: RootState) => state.images.selectedGroupId],
  (list, selectedGroupId) => {
    // 调试日志，帮助排查问题
    console.log('selectFilteredImages:', { 
      totalImages: list.length, 
      selectedGroupId, 
      isNull: selectedGroupId === null,
      isUndefined: selectedGroupId === undefined
    });
    
    // 如果selectedGroupId为null或undefined，返回所有照片
    if (selectedGroupId === null || selectedGroupId === undefined) {
      return list;
    }
    
    // 根据分组ID过滤照片
    return list.filter(image => 
      image && image.groups && Array.isArray(image.groups) && 
      image.groups.includes(selectedGroupId)
    );
  }
);

// 添加新的选择器，专门用于"我的照片"页面
export const selectMyImages = createSelector(
  [(state: RootState) => state.auth.user, // 获取用户
   (state: RootState) => state.images.list, // 获取照片列表
   (state: RootState) => state.images.selectedGroupId], // 获取选中的分组ID
  (currentUser, imageList, selectedGroupId) => {
    // 调试日志
    console.log('selectMyImages:', { 
      hasUser: !!currentUser, 
      totalImages: imageList.length, 
      selectedGroupId,
      isNull: selectedGroupId === null,
      isUndefined: selectedGroupId === undefined
    });
    
    if (!currentUser) return [];
    
    // 先按照所有者过滤
    let result = imageList.filter(img => {
      if (!img || img.owner === null || img.owner === undefined) return false;
      
      // 如果 owner 是数字类型
      if (typeof img.owner === 'number') {
        return img.owner === currentUser.id;
      }
      
      // 如果 owner 是字符串类型
      if (typeof img.owner === 'string') {
        // 检查是否为字符串形式的数字 ID
        if (!isNaN(Number(img.owner))) {
          return Number(img.owner) === currentUser.id;
        }
        // 否则认为是用户名
        return img.owner === currentUser.username;
      }
      
      return false;
    });
    
    // 然后再按照选定的分组过滤（如果有）
    if (selectedGroupId !== null && selectedGroupId !== undefined) {
      result = result.filter(image => 
        image && image.groups && Array.isArray(image.groups) && 
        image.groups.includes(selectedGroupId)
      );
    }
    
    return result;
  }
);
export const selectImagesStatus = (state: RootState) => state.images.status;
export const selectImagesError = (state: RootState) => state.images.error;
export const selectSelectedImageIds = (state: RootState) => state.images.selectedImageIds;
export const selectDeleteImageStatus = (state: RootState) => state.images.deleteStatus;
export const selectAllGroups = (state: RootState) => state.images.groups;
export const selectUploadStatus = (state: RootState) => state.images.uploadStatus;
export const selectUploadError = (state: RootState) => state.images.uploadError;
export const getUploadStatus = (state: RootState) => state.images.uploadStatus || 'idle';
export const getGroupsStatus = (state: RootState) => state.images.groupsStatus || 'idle';
export const getGroupsError = (state: RootState) => state.images.groupsError || null;
export const selectCurrentImage = (state: RootState) => state.images.currentImage;
export const selectDetailStatus = (state: RootState) => state.images.detailStatus;
export const selectDetailError = (state: RootState) => state.images.detailError;
export const selectUpdateStatus = (state: RootState) => state.images.updateStatus;
export const selectUpdateError = (state: RootState) => state.images.updateError;
export const selectDeleteStatus = (state: RootState) => state.images.deleteStatus;
export const selectDeleteError = (state: RootState) => state.images.deleteError;
export const selectSelectedGroupId = (state: RootState) => state.images.selectedGroupId;
export const selectGroups = (state: RootState) => state.images.groups;
export const selectGroupsError = (state: RootState) => state.images.groupsError;
export const selectGroupsStatus = (state: RootState) => state.images.groupsStatus;
export const selectImageDetail = (state: RootState) => state.images.currentImage;
export const getImageDetailStatus = (state: RootState) => state.images.detailStatus || 'idle';
export const getImageDetailError = (state: RootState) => state.images.detailError;