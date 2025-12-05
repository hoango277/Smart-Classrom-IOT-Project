import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Home = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Kiểm tra xem user đã đăng nhập chưa
        const token = localStorage.getItem('access_token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        🏫 Smart Classroom IOT
                    </h1>
                    <div className="space-x-4">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
                            >
                                Đăng xuất
                            </button>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold inline-block"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition font-semibold inline-block"
                                >
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-16">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-5xl font-bold text-gray-800 mb-6">
                        Chào mừng đến với Smart Classroom
                    </h2>
                    <p className="text-xl text-gray-600 mb-12">
                        Hệ thống quản lý lớp học thông minh với công nghệ IoT hiện đại
                    </p>

                    {isLoggedIn ? (
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="text-green-600 text-6xl mb-4">✓</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Đã đăng nhập thành công!
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Bạn có thể bắt đầu sử dụng hệ thống quản lý lớp học thông minh.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                <div className="bg-blue-50 p-6 rounded-lg">
                                    <h4 className="font-bold text-lg mb-2">🚪 Điều khiển cửa</h4>
                                    <p className="text-sm text-gray-600">Mở/đóng cửa phòng học từ xa</p>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-lg">
                                    <h4 className="font-bold text-lg mb-2">🪟 Điều khiển cửa sổ</h4>
                                    <p className="text-sm text-gray-600">Quản lý cửa sổ thông minh</p>
                                </div>
                                <div className="bg-yellow-50 p-6 rounded-lg">
                                    <h4 className="font-bold text-lg mb-2">💡 Điều khiển đèn</h4>
                                    <p className="text-sm text-gray-600">Bật/tắt đèn tự động</p>
                                </div>
                                <div className="bg-red-50 p-6 rounded-lg">
                                    <h4 className="font-bold text-lg mb-2">🔔 Hệ thống báo động</h4>
                                    <p className="text-sm text-gray-600">Quản lý an ninh lớp học</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">
                                Tính năng nổi bật
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="text-left">
                                    <div className="text-4xl mb-3">🚪</div>
                                    <h4 className="font-bold text-lg mb-2">Điều khiển từ xa</h4>
                                    <p className="text-gray-600">Quản lý cửa, cửa sổ, đèn thông qua giao diện web</p>
                                </div>
                                <div className="text-left">
                                    <div className="text-4xl mb-3">📊</div>
                                    <h4 className="font-bold text-lg mb-2">Giám sát thời gian thực</h4>
                                    <p className="text-gray-600">Theo dõi trạng thái thiết bị qua MQTT</p>
                                </div>
                                <div className="text-left">
                                    <div className="text-4xl mb-3">🔐</div>
                                    <h4 className="font-bold text-lg mb-2">Bảo mật cao</h4>
                                    <p className="text-gray-600">Xác thực người dùng với JWT token</p>
                                </div>
                                <div className="text-left">
                                    <div className="text-4xl mb-3">⚡</div>
                                    <h4 className="font-bold text-lg mb-2">Tự động hóa</h4>
                                    <p className="text-gray-600">Lập lịch và tự động hóa các tác vụ</p>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Vui lòng đăng nhập hoặc đăng ký để sử dụng hệ thống
                            </p>
                            <div className="space-x-4">
                                <Link
                                    to="/login"
                                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold inline-block"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition font-semibold inline-block"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8 mt-16">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-400">
                        © 2025 Smart Classroom IOT Project. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Home;