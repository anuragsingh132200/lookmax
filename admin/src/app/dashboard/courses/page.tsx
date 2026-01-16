'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Course {
    id: string;
    title: string;
    description: string;
    isActive: boolean;
    totalChapters: number;
    totalDuration: number;
    modules?: any[];
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: '', description: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const data = await api.getCourses();
            setCourses(data);
        } catch (error) {
            console.error('Failed to load courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const course = await api.createCourse(newCourse);
            setCourses([...courses, course]);
            setShowCreateModal(false);
            setNewCourse({ title: '', description: '' });
        } catch (error) {
            alert('Failed to create course');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;

        try {
            await api.deleteCourse(id);
            setCourses(courses.filter((c) => c.id !== id));
        } catch (error) {
            alert('Failed to delete course');
        }
    };

    const handleToggleActive = async (course: Course) => {
        try {
            await api.updateCourse(course.id, { isActive: !course.isActive });
            setCourses(courses.map((c) =>
                c.id === course.id ? { ...c, isActive: !c.isActive } : c
            ));
        } catch (error) {
            alert('Failed to update course');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Courses</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
                >
                    + Add Course
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 hover:border-gray-600 transition"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-semibold">{course.title}</h2>
                                        <span
                                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${course.isActive
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                                }`}
                                        >
                                            {course.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 mb-4">{course.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>📚 {course.modules?.length || 0} modules</span>
                                        <span>📖 {course.totalChapters} chapters</span>
                                        <span>⏱️ {Math.round(course.totalDuration / 60)} min</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/dashboard/courses/${course.id}`}
                                        className="text-purple-400 hover:text-purple-300 px-3 py-2 transition"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleToggleActive(course)}
                                        className="text-yellow-400 hover:text-yellow-300 px-3 py-2 transition"
                                    >
                                        {course.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="text-red-400 hover:text-red-300 px-3 py-2 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {courses.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-gray-800/50 rounded-2xl border border-gray-700">
                            No courses yet. Click "Add Course" to create one.
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
                        <form onSubmit={handleCreate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={newCourse.title}
                                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition"
                                        placeholder="Enter course title"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Description</label>
                                    <textarea
                                        value={newCourse.description}
                                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition h-24 resize-none"
                                        placeholder="Enter course description"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
