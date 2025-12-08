import axios from 'axios';

// Tạo axios instance với config mặc định
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // 10 giây timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm authorization token (nếu cần)
axiosInstance.interceptors.request.use(
  (config) => {
    // Thêm access token vào header
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi chung
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Xử lý lỗi chung
    if (error.response?.status === 401) {
      // Token hết hạn, redirect về login
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }

    // Trả về lỗi với thông tin dễ đọc
    const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance; 