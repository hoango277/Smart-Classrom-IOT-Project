import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Tạo form data dạng x-www-form-urlencoded
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await axios.post(
                'http://127.0.0.1:8000/api/auth/login',
                formData,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            // Đăng nhập thành công (status 200)
            if (response.status === 200) {
                const { access_token, token_type } = response.data;

                // Lưu token vào localStorage
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('token_type', token_type);

                // Chuyển về trang home
                navigate('/');
            }
        } catch (err) {
            // Xử lý lỗi
            if (err.response?.status === 401) {
                setError(err.response.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
            } else {
                setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition">
                        🏫 Smart Classroom IOT
                    </Link>
                    <div className="space-x-4">
                        <Link
                            to="/register"
                            className="text-gray-600 hover:text-blue-600 font-semibold transition"
                        >
                            Đăng ký
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex items-center justify-center px-4 py-12">
                <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-10">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-gray-800 mb-3">Đăng Nhập</h1>
                        <p className="text-gray-600 text-lg">Hệ thống quản lý lớp học thông minh</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-base font-medium text-gray-700 mb-2">
                                Tên đăng nhập
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full px-5 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Nhập tên đăng nhập"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-5 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Nhập mật khẩu"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-4 text-lg rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
