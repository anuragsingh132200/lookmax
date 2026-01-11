import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import api from '../api';
import './Content.css';

function Content() {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingContent, setEditingContent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: 'skin',
        description: '',
        isPremium: false,
        order: 0,
    });

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            const response = await api.get('/api/content/courses');
            setContent(response.data);
        } catch (error) {
            console.log('Error loading content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingContent) {
                await api.put(`/api/admin/content/${editingContent.id}`, formData);
            } else {
                await api.post('/api/admin/content', formData);
            }
            setShowModal(false);
            setEditingContent(null);
            setFormData({
                title: '',
                category: 'skin',
                description: '',
                isPremium: false,
                order: 0,
            });
            loadContent();
        } catch (error) {
            console.log('Error saving content:', error);
        }
    };

    const editContent = (item) => {
        setEditingContent(item);
        setFormData({
            title: item.title,
            category: item.category,
            description: item.description || '',
            isPremium: item.isPremium,
            order: item.order,
        });
        setShowModal(true);
    };

    const deleteContent = async (id) => {
        if (!confirm('Are you sure you want to delete this content?')) return;

        try {
            await api.delete(`/api/admin/content/${id}`);
            loadContent();
        } catch (error) {
            console.log('Error deleting content:', error);
        }
    };

    const categoryLabels = {
        skin: '💆 Skin Care',
        hair: '💇 Hair',
        gym: '💪 Gym & Fitness',
        mental: '🧠 Mental Health',
        facial: '👁️ Facial Analysis',
    };

    if (loading) {
        return <div className="loading">Loading content...</div>;
    }

    return (
        <div className="content-page">
            <header className="page-header">
                <div>
                    <h1>Content</h1>
                    <p>Manage courses and guides</p>
                </div>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    Add Content
                </button>
            </header>

            <div className="content-grid">
                {content.map((item) => (
                    <div key={item.id} className="content-card">
                        <div className="content-header">
                            <span className="content-category">{categoryLabels[item.category]}</span>
                            {item.isPremium ? (
                                <Lock size={16} className="premium-icon" />
                            ) : (
                                <Unlock size={16} className="free-icon" />
                            )}
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <div className="content-meta">
                            <span>{item.moduleCount || 0} modules</span>
                        </div>
                        <div className="content-actions">
                            <button className="edit-btn" onClick={() => editContent(item)}>
                                <Edit size={16} />
                                Edit
                            </button>
                            <button className="delete-btn" onClick={() => deleteContent(item.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingContent ? 'Edit Content' : 'Add Content'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="skin">Skin Care</option>
                                    <option value="hair">Hair</option>
                                    <option value="gym">Gym & Fitness</option>
                                    <option value="mental">Mental Health</option>
                                    <option value="facial">Facial Analysis</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="form-group checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.isPremium}
                                        onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                                    />
                                    Premium Content
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    {editingContent ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Content;
