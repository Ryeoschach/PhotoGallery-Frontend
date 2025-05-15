import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import apiClient from '../../services/request';

// 照片数据的接口
export interface Image {
  id: number;
  name: string;
  description: string;
  image: string; // URL 地址
  uploaded_at: string;
  user: number; // 用户 ID
  width: number;  // 添加这些字段
  height: number;
  size: number;
  groups: number[]; // 组 ID 数组
  // 根据实际 API 返回添加其他字段
}

// 编辑照片的请求数据接口
export interface ImageUpdateRequest {
  id: number;
  name?: string;
  description?: string;
}

// 上传照片的请求数据接口
export interface ImageUploadRequest {
  name: string;     // 修改为 name 而不是 title
  description: string;
  image: File;
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
};

// 获取所有照片列表
export const fetchImages = createAsyncThunk(
  'images/fetchImages',
  async () => {
    const response = await apiClient.get<Image[]>('/images/');
    return response;
  }
);

// 获取单张照片详情
export const fetchImageDetail = createAsyncThunk(
  'images/fetchImageDetail',
  async (id: number) => {
    const response = await apiClient.get<Image>(`/images/${id}/`);
    return response;
  }
);

// 上传新照片
export const uploadImage = createAsyncThunk(
  'images/uploadImage',
  async (imageData: ImageUploadRequest) => {
    const formData = new FormData();
    formData.append('name', imageData.name);
    formData.append('description', imageData.description || '');
    formData.append('image', imageData.image);

    console.log('Uploading image with data:', imageData); // 调试日志
    
    // 修正调用方式，将 URL 和选项对象作为两个参数传递
    const response = await apiClient.post<Image>('/images/', {
      data: formData,  // 将 formData 作为 data 属性
      requestType: 'form',  // 指定请求类型为 form
      headers: {}  // 可以保留空的 headers 对象
    });
    
    return response;
  }
);


// 更新照片信息
export const updateImage = createAsyncThunk(
  'images/updateImage',
  async (imageData: ImageUpdateRequest) => {
    const { id, ...updateData } = imageData;
    
    console.log('Updating image with data:', updateData); // 调试日志
    
    const response = await apiClient.patch<Image>(`/images/${id}/`, {
      data: updateData,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Update response:', response); // 添加响应日志
    return response;
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
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取照片列表
      .addCase(fetchImages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchImages.fulfilled, (state, action: PayloadAction<Image[]>) => {
        state.status = 'succeeded';
        state.list = action.payload;
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
      .addCase(fetchImageDetail.fulfilled, (state, action: PayloadAction<Image>) => {
        state.detailStatus = 'succeeded';
        state.currentImage = action.payload;
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
      .addCase(uploadImage.fulfilled, (state, action: PayloadAction<Image>) => {
        state.uploadStatus = 'succeeded';
        state.list.unshift(action.payload); // 添加到列表开头
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
      .addCase(updateImage.fulfilled, (state, action: PayloadAction<Image>) => {
        state.updateStatus = 'succeeded';
        // 更新列表中的照片
        const index = state.list.findIndex(img => img.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        // 如果当前正在查看的是这张照片，也更新它
        if (state.currentImage && state.currentImage.id === action.payload.id) {
          state.currentImage = action.payload;
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
  selectAllImages: selectAllImagesAction
} = imagesSlice.actions;

// 导出 reducer
export default imagesSlice.reducer;

// 导出 selectors
export const selectAllImages = (state: RootState) => state.images.list;
export const getImagesStatus = (state: RootState) => state.images.status;
export const getImagesError = (state: RootState) => state.images.error;

export const selectImageDetail = (state: RootState) => state.images.currentImage;
export const getImageDetailStatus = (state: RootState) => state.images.detailStatus;
export const getImageDetailError = (state: RootState) => state.images.detailError;

export const getUploadStatus = (state: RootState) => state.images.uploadStatus;
export const getUploadError = (state: RootState) => state.images.uploadError;

export const getUpdateStatus = (state: RootState) => state.images.updateStatus;
export const getUpdateError = (state: RootState) => state.images.updateError;

export const getDeleteStatus = (state: RootState) => state.images.deleteStatus;
export const getDeleteError = (state: RootState) => state.images.deleteError;

export const getSelectedImageIds = (state: RootState) => state.images.selectedImageIds;