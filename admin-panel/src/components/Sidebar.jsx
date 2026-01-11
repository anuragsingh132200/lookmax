import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Diamond
} from 'lucide-react';
import './Sidebar.css';

function Sidebar({ open, toggle }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/users', icon: Users, label: 'Users' },
        { path: '/content', icon: BookOpen, label: 'Content' },
        { path: '/events', icon: Calendar, label: 'Events' },
    ];

    return (
        <aside className={`sidebar ${open ? '' : 'collapsed'}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <Diamond size={28} color="#6c5ce7" />
                    {open && <span>LookMax Admin</span>}
                </div>
                <button className="toggle-btn" onClick={toggle}>
                    {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        end={item.path === '/'}
                    >
                        <item.icon size={22} />
                        {open && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={22} />
                    {open && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
