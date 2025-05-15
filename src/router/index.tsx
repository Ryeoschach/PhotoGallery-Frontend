import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App'; // 你的根 App 组件，可能包含布局
import HomePage from '../pages/HomePage';
// import UsersPage from '../pages/UsersPage'; // 包含 UserList 的页面
// import UserDetailPage from '../pages/UserDetailPage'; // 新增的用户详情页面
import ImageDetailPage from '../pages/ImageDetailPage'; // 新增的图片详情页面

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // 或者 <MainLayout />
    // errorElement: <ErrorPage />, // 可选的错误边界页面
    children: [
      {
        index: true, // 默认子路由
        element: <HomePage />,
      },
    //   {
    //     path: 'users',
    //     element: <UsersPage />,
    //   },
    //   {
    //     path: 'users/:username',
    //     element: <UserDetailPage />,
    //   },
      {
        path: 'images/:id',
        element: <ImageDetailPage />,
      },
      // ... 其他路由
    ],
  },
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;