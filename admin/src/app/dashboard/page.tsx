'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Stats {
    totalUsers: number;
    totalCourses: number;
    activeSubscriptions: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalCourses: 0, activeSubscriptions: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [users, courses] = await Promise.all([
                api.getUsers(),
                api.getCourses(),
            ]);

            setStats({
                totalUsers: users.length,
                totalCourses: courses.length,
                activeSubscriptions: users.filter((u: any) => u.subscription?.status === 'active').length,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-blue-500 to-blue-600' },
        { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: '👑', color: 'from-yellow-500 to-orange-500' },
        { label: 'Total Courses', value: stats.totalCourses, icon: '📚', color: 'from-purple-500 to-purple-600' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {statCards.map((stat) => (
                            <div
                                key={stat.label}
                                className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-3xl">{stat.icon}</span>
                                </div>
                                <p className="text-4xl font-bold mb-1">{stat.value}</p>
                                <p className="text-white/80">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
                        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <a
                                href="/dashboard/users"
                                className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-purple-500/50 transition"
                            >
                                <span className="text-2xl">👥</span>
                                <div>
                                    <p className="font-medium">Manage Users</p>
                                    <p className="text-sm text-gray-500">View and manage user accounts</p>
                                </div>
                            </a>
                            <a
                                href="/dashboard/courses"
                                className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-purple-500/50 transition"
                            >
                                <span className="text-2xl">📚</span>
                                <div>
                                    <p className="font-medium">Manage Courses</p>
                                    <p className="text-sm text-gray-500">Create and edit course content</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
