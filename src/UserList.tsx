import React, { useEffect, useState } from 'react';

// 1. 定义用户数据的接口 (根据你API返回的实际结构调整)
interface User {
  id: number;
  username: string;
  email?: string; // 假设 email 是可选的
  // ... 其他你期望从API获取的用户字段
}

const UserList: React.FC = () => {
  // 2. 定义状态变量
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 3. 使用 useEffect 在组件挂载时获取数据
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        //const response = await fetch('http://127.0.0.1:8000/api/users/'); // 你的后端API地址
        const response = await fetch('/api/users/'); // 使用代理时可以省略前缀
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // 空依赖数组表示仅在组件挂载时运行一次

  // 4. 根据状态渲染UI
  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p>Error fetching users: {error}</p>;
  }

  return (
    <div>
      <h1>User List</h1>
      {users.length > 0 ? (
        <ul>
          {users.map(user => (
            <li key={user.id}>
              <strong>{user.username}</strong>
              {user.email && ` - ${user.email}`}
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default UserList;