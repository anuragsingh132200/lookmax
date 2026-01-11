import { useState, useEffect } from 'react';
import { Search, MoreVertical, Crown, Trash2 } from 'lucide-react';
import api from '../api';
import './Users.css';

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await api.get('/api/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.log('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePremium = async (userId, currentStatus) => {
        try {
            await api.put(`/api/admin/users/${userId}?isPremium=${!currentStatus}`);
            loadUsers();
        } catch (error) {
            console.log('Error updating user:', error);
        }
    };

    const deleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await api.delete(`/api/admin/users/${userId}`);
            loadUsers();
        } catch (error) {
            console.log('Error deleting user:', error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    return (
        <div className="users-page">
            <header className="page-header">
                <div>
                    <h1>Users</h1>
                    <p>Manage all registered users</p>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            {user.name?.charAt(0) || 'U'}
                                        </div>
                                        <span>{user.name}</span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`role-badge ${user.role}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    {user.isPremium ? (
                                        <span className="status-badge premium">
                                            <Crown size={14} /> Premium
                                        </span>
                                    ) : (
                                        <span className="status-badge free">Free</span>
                                    )}
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className={`action-btn ${user.isPremium ? 'remove' : 'add'}`}
                                            onClick={() => togglePremium(user.id, user.isPremium)}
                                            title={user.isPremium ? 'Remove Premium' : 'Give Premium'}
                                        >
                                            <Crown size={16} />
                                        </button>
                                        {user.role !== 'admin' && (
                                            <button
                                                className="action-btn delete"
                                                onClick={() => deleteUser(user.id)}
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && (
                <div className="empty-state">
                    <p>No users found</p>
                </div>
            )}
        </div>
    );
}

export default Users;
