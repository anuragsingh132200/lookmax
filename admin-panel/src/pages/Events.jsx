import { useState, useEffect } from 'react';
import { Plus, Users, Trash2, Calendar } from 'lucide-react';
import api from '../api';
import './Events.css';

function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_type: 'coaching',
        date: '',
        duration: 60,
        host: '',
        maxParticipants: 50,
        isPremium: false,
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const response = await api.get('/api/events?upcoming=false');
            setEvents(response.data);
        } catch (error) {
            console.log('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const params = new URLSearchParams();
            Object.entries(formData).forEach(([key, value]) => {
                params.append(key, value);
            });

            await api.post(`/api/admin/events?${params.toString()}`);
            setShowModal(false);
            setFormData({
                title: '',
                description: '',
                event_type: 'coaching',
                date: '',
                duration: 60,
                host: '',
                maxParticipants: 50,
                isPremium: false,
            });
            loadEvents();
        } catch (error) {
            console.log('Error creating event:', error);
        }
    };

    const deleteEvent = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            await api.delete(`/api/admin/events/${id}`);
            loadEvents();
        } catch (error) {
            console.log('Error deleting event:', error);
        }
    };

    const eventTypeLabels = {
        coaching: '🎥 1:1 Coaching',
        talk: '🎤 Skincare Talk',
        workshop: '💪 Workshop',
        general: '📅 General',
    };

    if (loading) {
        return <div className="loading">Loading events...</div>;
    }

    return (
        <div className="events-page">
            <header className="page-header">
                <div>
                    <h1>Events</h1>
                    <p>Manage coaching sessions and talks</p>
                </div>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    Create Event
                </button>
            </header>

            <div className="events-list">
                {events.map((event) => (
                    <div key={event.id} className="event-card">
                        <div className="event-date">
                            <Calendar size={18} />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                            <span className="event-time">
                                {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="event-info">
                            <span className="event-type">{eventTypeLabels[event.type]}</span>
                            <h3>{event.title}</h3>
                            <p>{event.description}</p>
                            <div className="event-meta">
                                <span className="participants">
                                    <Users size={14} />
                                    {event.participantCount || 0} / {event.maxParticipants || '∞'}
                                </span>
                                {event.host && <span className="host">Host: {event.host}</span>}
                                {event.isPremium && <span className="premium-badge">Premium</span>}
                            </div>
                        </div>
                        <button className="delete-btn" onClick={() => deleteEvent(event.id)}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            {events.length === 0 && (
                <div className="empty-state">
                    <Calendar size={48} />
                    <p>No events yet</p>
                    <button className="add-btn" onClick={() => setShowModal(true)}>
                        Create your first event
                    </button>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Create Event</h2>
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
                                <label>Type</label>
                                <select
                                    value={formData.event_type}
                                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                                >
                                    <option value="coaching">1:1 Coaching</option>
                                    <option value="talk">Skincare Talk</option>
                                    <option value="workshop">Workshop</option>
                                    <option value="general">General</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Duration (min)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Host</label>
                                    <input
                                        type="text"
                                        value={formData.host}
                                        onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Max Participants</label>
                                    <input
                                        type="number"
                                        value={formData.maxParticipants}
                                        onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="form-group checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.isPremium}
                                        onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                                    />
                                    Premium Only
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    Create Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Events;
