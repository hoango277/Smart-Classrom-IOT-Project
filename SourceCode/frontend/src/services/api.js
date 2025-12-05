import axiosInstance from '../config/axios.js';

// API service methods
export const apiService = {
  // GET request
  get: (url, config = {}) => {
    return axiosInstance.get(url, config);
  },

  // POST request
  post: (url, data = {}, config = {}) => {
    return axiosInstance.post(url, data, config);
  },

  // PUT request
  put: (url, data = {}, config = {}) => {
    return axiosInstance.put(url, data, config);
  },

  // PATCH request
  patch: (url, data = {}, config = {}) => {
    return axiosInstance.patch(url, data, config);
  },

  // DELETE request
  delete: (url, config = {}) => {
    return axiosInstance.delete(url, config);
  },
};

// Các API endpoints cụ thể (ví dụ)
export const userAPI = {
  // Lấy thông tin user
  getProfile: () => apiService.get('/user/profile'),
  
  // Cập nhật thông tin user
  updateProfile: (data) => apiService.put('/user/profile', data),
  
  // Đăng nhập
  login: (credentials) => apiService.post('/auth/login', credentials),
  
  // Đăng ký
  register: (userData) => apiService.post('/auth/register', userData),
  
  // Đăng xuất
  logout: () => apiService.post('/auth/logout'),
};

export default apiService; 