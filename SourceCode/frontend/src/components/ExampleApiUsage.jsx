import React, { useState, useEffect } from 'react';
import { apiService, userAPI } from '../services/api.js';

const ExampleApiUsage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ví dụ gọi API với apiService
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Sử dụng apiService.get
      const data = await apiService.get('/users');
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ví dụ gọi API login với userAPI
  const handleLogin = async () => {
    try {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const response = await userAPI.login(credentials);
      console.log('Login thành công:', response);
      
      // Lưu token vào localStorage (đã được xử lý trong interceptor)
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err.message);
    }
  };

  // Ví dụ post data
  const createUser = async () => {
    try {
      const newUser = {
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com'
      };
      
      const response = await apiService.post('/users', newUser);
      console.log('Tạo user thành công:', response);
      
      // Refresh danh sách users
      fetchUsers();
    } catch (err) {
      console.error('Lỗi tạo user:', err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Ví dụ sử dụng API</h2>
      
      <div className="mb-4 space-x-2">
        <button 
          onClick={fetchUsers}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Lấy danh sách Users
        </button>
        <button 
          onClick={handleLogin}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Login
        </button>
        <button 
          onClick={createUser}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Tạo User mới
        </button>
      </div>

      {loading && <p className="text-blue-500">Đang tải...</p>}
      {error && <p className="text-red-500">Lỗi: {error}</p>}

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Danh sách Users:</h3>
        <div className="space-y-2">
          {users.map((user, index) => (
            <div key={user.id || index} className="p-3 border rounded">
              <p><strong>Tên:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h4 className="font-semibold mb-2">Cách sử dụng:</h4>
        <pre className="text-sm">
{`// Import API service
import { apiService, userAPI } from '../services/api.js';

// Gọi API GET
const data = await apiService.get('/users');

// Gọi API POST
const response = await apiService.post('/users', newUser);

// Sử dụng userAPI có sẵn
const userProfile = await userAPI.getProfile();
const loginResponse = await userAPI.login(credentials);`}
        </pre>
      </div>
    </div>
  );
};

export default ExampleApiUsage; 