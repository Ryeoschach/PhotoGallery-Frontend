// 或者任何包含首页链接的组件

import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { setSelectedGroup } from '../features/images/imagesSlice';
import type { AppDispatch } from '../app/store';  // 确保导入 AppDispatch 类型

// 添加 export 关键字
export const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // 点击 Home 按钮时清除分组过滤
  const handleHomeClick = () => {
    dispatch(setSelectedGroup(null));
  };
  
  return (
    <header>
      <nav>
        <Link to="/" onClick={handleHomeClick}>Home</Link>
        {/* 其他导航链接... */}
      </nav>
    </header>
  );
};

// 添加默认导出
export default Header;