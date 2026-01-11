import { useState, useEffect } from 'react';
import { Users, Scan, FileText, TrendingUp } from 'lucide-react';
import api from '../api';
import './Dashboard.css';

function Dashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const response = await api.get('/api/admin/analytics');
            setAnalytics(response.data);
        } catch (error) {
            console.log('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading analytics...</div>;
    }

    return (
        <div className="dashboard">
            <header className="page-header">
                <h1>Dashboard</h1>
                <p>Overview of your LookMax application</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon users">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{analytics?.totalUsers || 0}</h3>
                        <p>Total Users</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon premium">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{analytics?.premiumUsers || 0}</h3>
                        <p>Premium Users</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon scans">
                        <Scan size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{analytics?.totalScans || 0}</h3>
                        <p>Total Scans</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon posts">
                        <FileText size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{analytics?.totalPosts || 0}</h3>
                        <p>Forum Posts</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h2>Weekly Activity</h2>
                    <div className="activity-stats">
                        <div className="activity-item">
                            <span className="activity-label">New Users</span>
                            <span className="activity-value">{analytics?.newUsersThisWeek || 0}</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-label">Face Scans</span>
                            <span className="activity-value">{analytics?.scansThisWeek || 0}</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-label">Premium Rate</span>
                            <span className="activity-value">{analytics?.premiumRate || 0}%</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h2>Quick Actions</h2>
                    <div className="quick-actions">
                        <a href="/users" className="action-btn">
                            <Users size={20} />
                            Manage Users
                        </a>
                        <a href="/content" className="action-btn">
                            <FileText size={20} />
                            Edit Content
                        </a>
                        <a href="/events" className="action-btn">
                            <Scan size={20} />
                            Create Event
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
