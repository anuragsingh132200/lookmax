import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Content from './pages/Content'
import Events from './pages/Events'
import Login from './pages/Login'
import './App.css'

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <div className="app-layout">
                            <Sidebar open={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
                            <main className={`main-content ${sidebarOpen ? '' : 'collapsed'}`}>
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/users" element={<Users />} />
                                    <Route path="/content" element={<Content />} />
                                    <Route path="/events" element={<Events />} />
                                </Routes>
                            </main>
                        </div>
                    </ProtectedRoute>
                }
            />
        </Routes>
    )
}

export default App
