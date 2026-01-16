'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Chapter {
    _id: string;
    title: string;
    type: string;
    content: string;
    duration?: number;
    order: number;
}

interface Module {
    _id: string;
    title: string;
    description?: string;
    order: number;
    chapters: Chapter[];
}

interface Course {
    id: string;
    title: string;
    description: string;
    isActive: boolean;
    modules: Module[];
}

export default function CourseEditPage() {
    const params = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [showChapterModal, setShowChapterModal] = useState<string | null>(null);
    const [newModule, setNewModule] = useState({ title: '', description: '' });
    const [newChapter, setNewChapter] = useState({ title: '', type: 'video', content: '', duration: 0 });

    useEffect(() => {
        loadCourse();
    }, [params.id]);

    const loadCourse = async () => {
        try {
            const data = await api.getCourse(params.id as string);
            setCourse(data);
        } catch (error) {
            console.error('Failed to load course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddModule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.addModule(params.id as string, {
                ...newModule,
                order: course?.modules?.length || 0,
            });
            await loadCourse();
            setShowModuleModal(false);
            setNewModule({ title: '', description: '' });
        } catch (error) {
            alert('Failed to add module');
        }
    };

    const handleAddChapter = async (e: React.FormEvent, moduleId: string) => {
        e.preventDefault();
        const module = course?.modules.find((m) => m._id === moduleId);
        try {
            await api.addChapter(params.id as string, moduleId, {
                ...newChapter,
                order: module?.chapters?.length || 0,
            });
            await loadCourse();
            setShowChapterModal(null);
            setNewChapter({ title: '', type: 'video', content: '', duration: 0 });
        } catch (error) {
            alert('Failed to add chapter');
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm('Delete this module and all its chapters?')) return;
        try {
            await api.deleteModule(params.id as string, moduleId);
            await loadCourse();
        } catch (error) {
            alert('Failed to delete module');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!course) {
        return <div className="text-center text-gray-500">Course not found</div>;
    }

    return (
        <div>
            <button
                onClick={() => router.back()}
                className="text-purple-400 hover:text-purple-300 mb-4"
            >
                ← Back to Courses
            </button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    <p className="text-gray-400 mt-1">{course.description}</p>
                </div>
                <button
                    onClick={() => setShowModuleModal(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
                >
                    + Add Module
                </button>
            </div>

            {/* Modules */}
            <div className="space-y-6">
                {course.modules?.map((module, index) => (
                    <div
                        key={module._id}
                        className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-4 bg-gray-900/50 border-b border-gray-700">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold">
                                    {index + 1}
                                </span>
                                <div>
                                    <h3 className="font-semibold">{module.title}</h3>
                                    {module.description && (
                                        <p className="text-sm text-gray-500">{module.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowChapterModal(module._id)}
                                    className="text-purple-400 hover:text-purple-300 px-3 py-1 transition"
                                >
                                    + Chapter
                                </button>
                                <button
                                    onClick={() => handleDeleteModule(module._id)}
                                    className="text-red-400 hover:text-red-300 px-3 py-1 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        {/* Chapters */}
                        <div className="divide-y divide-gray-700">
                            {module.chapters?.map((chapter) => (
                                <div key={chapter._id} className="p-4 flex items-center gap-4">
                                    <span className="text-xl">
                                        {chapter.type === 'video' ? '🎬' : chapter.type === 'image' ? '🖼️' : '📄'}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium">{chapter.title}</p>
                                        <p className="text-sm text-gray-500">
                                            {chapter.type} {chapter.duration ? `• ${Math.round(chapter.duration / 60)} min` : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!module.chapters || module.chapters.length === 0) && (
                                <div className="p-4 text-gray-500 text-center">
                                    No chapters yet
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {(!course.modules || course.modules.length === 0) && (
                    <div className="text-center py-12 text-gray-500 bg-gray-800/50 rounded-2xl border border-gray-700">
                        No modules yet. Click "Add Module" to create one.
                    </div>
                )}
            </div>

            {/* Add Module Modal */}
            {showModuleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4">Add Module</h2>
                        <form onSubmit={handleAddModule}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={newModule.title}
                                        onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Description (optional)</label>
                                    <input
                                        type="text"
                                        value={newModule.description}
                                        onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModuleModal(false)} className="px-4 py-2 text-gray-400">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg">
                                    Add Module
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Chapter Modal */}
            {showChapterModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4">Add Chapter</h2>
                        <form onSubmit={(e) => handleAddChapter(e, showChapterModal)}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={newChapter.title}
                                        onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Type</label>
                                    <select
                                        value={newChapter.type}
                                        onChange={(e) => setNewChapter({ ...newChapter, type: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="video">Video</option>
                                        <option value="image">Image</option>
                                        <option value="text">Text</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Content URL</label>
                                    <input
                                        type="text"
                                        value={newChapter.content}
                                        onChange={(e) => setNewChapter({ ...newChapter, content: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                                        placeholder={newChapter.type === 'text' ? 'Enter text content' : 'Enter URL'}
                                        required
                                    />
                                </div>
                                {newChapter.type === 'video' && (
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Duration (seconds)</label>
                                        <input
                                            type="number"
                                            value={newChapter.duration}
                                            onChange={(e) => setNewChapter({ ...newChapter, duration: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowChapterModal(null)} className="px-4 py-2 text-gray-400">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg">
                                    Add Chapter
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
