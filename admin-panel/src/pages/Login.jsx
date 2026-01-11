import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Diamond, Eye, EyeOff } from 'lucide-react';
import api from '../api';
import './Login.css';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@lookmax.com');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('adminToken', response.data.access_token);

            // Verify admin role
            const userResponse = await api.get('/api/auth/me');
            if (userResponse.data.role !== 'admin') {
                localStorage.removeItem('adminToken');
                setError('Access denied. Admin role required.');
                return;
            }

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <Diamond size={48} color="#6c5ce7" />
                    </div>
                    <h1>LookMax Admin</h1>
                    <p>Sign in to access the admin panel</p>
                </div>

                <form onSubmit={handleLogin}>
                    {error && <div className="login-error">{error}</div>}

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@lookmax.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Default admin: admin@lookmax.com / admin123</p>
                </div>
            </div>
        </div>
    );
}

export default Login;
