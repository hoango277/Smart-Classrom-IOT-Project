import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate password length
        if (password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/users/register',
                {
                    username,
                    password,
                    role,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Đăng ký thành công (status 200)
            if (response.status === 200) {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                navigate('/login');
            }
        } catch (err) {
            // Xử lý lỗi
            if (err.response?.status === 409) {
                setError('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-purple-600 transition">
                        🏫 Smart Classroom IOT
                    </Link>
                    <div className="space-x-4">
                        <Link
                            to="/login"
                            className="text-gray-600 hover:text-purple-600 font-semibold transition"
                        >
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex items-center justify-center px-4 py-12">
                <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-10">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-gray-800 mb-3">Đăng Ký</h1>
                        <p className="text-gray-600 text-lg">Tạo tài khoản mới</p>
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
                                className="w-full px-5 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
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
                                minLength={8}
                                className="w-full px-5 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                            />
                            <p className="text-sm text-gray-500 mt-1">Mật khẩu phải có ít nhất 8 ký tự</p>
                        </div>

                        {/* Role Field */}
                        <div>
                            <label htmlFor="role" className="block text-base font-medium text-gray-700 mb-2">
                                Vai trò
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                                className="w-full px-5 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white"
                            >
                                <option value="student">Học sinh</option>
                                <option value="teacher">Giáo viên</option>
                            </select>
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
                            className="w-full bg-purple-600 text-white py-4 text-lg rounded-lg font-semibold hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
