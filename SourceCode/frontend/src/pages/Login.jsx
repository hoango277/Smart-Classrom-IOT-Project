import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../config/axios';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Create form data as x-www-form-urlencoded
            const urlEncodedData = new URLSearchParams();
            urlEncodedData.append('username', formData.username);
            urlEncodedData.append('password', formData.password);

            const response = await axios.post(
                'http://127.0.0.1:8000/api/auth/login',
                urlEncodedData,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            // Store tokens (response: {access_token, token_type})
            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('token_type', response.data.token_type);
                localStorage.setItem('username', formData.username);

                // Fetch user profile to get role
                try {
                    const profileResponse = await axiosInstance.get('/users/me', {
                        headers: {
                            'Authorization': `Bearer ${response.data.access_token}`
                        }
                    });

                    // Response: { id: number, username: string, role: string }
                    if (profileResponse.role) {
                        localStorage.setItem('role', profileResponse.role);
                    }
                } catch (profileErr) {
                    console.error('Failed to fetch user profile:', profileErr);
                    // Continue anyway, role might not be required for basic access
                }
            }

            navigate('/dashboard');
        } catch (err) {
            if (err.response?.status === 401) {
                setError(err.response.data?.message || 'Invalid username or password');
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -top-20 -left-20 pointer-events-none"></div>

            <div className="bg-surface w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
                    <p className="text-text-muted">Please sign in to your accounts</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm text-text-muted mb-2">Username</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-background border border-text-muted/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="admin"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-muted mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-background border border-text-muted/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-text-muted">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:text-white font-bold transition-colors">
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
