import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);

        try {
            await axiosInstance.post('/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] bottom-0 right-0 pointer-events-none"></div>

            <div className="bg-surface w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-text-muted">Join us to control your devices!</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-text-muted mb-2">Username</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-background border border-text-muted/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-muted mb-2">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-background border border-text-muted/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-muted mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-background border border-text-muted/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-muted mb-2">Confirm Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-background border border-text-muted/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-text-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="text-secondary hover:text-white font-bold transition-colors">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
