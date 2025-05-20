import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import HomePage from '../pages/HomePage';
import ImageDetailPage from '../pages/ImageDetailPage';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import ProfilePage from '../features/auth/ProfilePage';
import MyPhotosPage from '../pages/MyPhotosPage';
import GroupsPage from '../pages/GroupsPage';
import ProtectedRoute from '../components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'profile',
        element: <ProtectedRoute element={<ProfilePage />} />,
      },
      {
        path: 'images/:imageId',
        element: <ImageDetailPage />,
      },
      {
        path: 'my-photos',
        element: <ProtectedRoute element={<MyPhotosPage />} />,
      },
      {
        path: 'groups',
        element: <ProtectedRoute element={<GroupsPage />} />,
      },
    ],
  },
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;