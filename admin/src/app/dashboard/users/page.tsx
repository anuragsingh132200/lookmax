'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    subscription?: {
        status: string;
    };
    isOnboarded: boolean;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        setDeleteId(id);
        try {
            await api.deleteUser(id);
            setUsers(users.filter((u) => u.id !== id));
        } catch (error) {
            alert('Failed to delete user');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Users</h1>
                <span className="text-gray-500">{users.length} total</span>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="text-left px-6 py-4 text-gray-400 font-medium">User</th>
                                <th className="text-left px-6 py-4 text-gray-400 font-medium">Status</th>
                                <th className="text-left px-6 py-4 text-gray-400 font-medium">Subscription</th>
                                <th className="text-left px-6 py-4 text-gray-400 font-medium">Joined</th>
                                <th className="text-right px-6 py-4 text-gray-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-700/30 transition">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${user.isOnboarded
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-yellow-500/20 text-yellow-400'
                                                }`}
                                        >
                                            {user.isOnboarded ? 'Active' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${user.subscription?.status === 'active'
                                                    ? 'bg-purple-500/20 text-purple-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                                }`}
                                        >
                                            {user.subscription?.status === 'active' ? '👑 Premium' : 'Free'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            disabled={deleteId === user.id}
                                            className="text-red-400 hover:text-red-300 disabled:opacity-50 transition"
                                        >
                                            {deleteId === user.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No users found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
