export interface Image {
  id: number;
  name: string;
  description?: string;
  image: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  size?: number;
  groups: number[]; // 图片所属的分组ID数组
  owner: string | number | null; // 添加 owner 属性，可以是字符串、数字或 null
  uploaded_at: string;
  updated_at: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
}

// 其他类型定义...