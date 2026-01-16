const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('admin_token', token);
            } else {
                localStorage.removeItem('admin_token');
            }
        }
    }

    getToken() {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('admin_token');
        }
        return this.token;
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>,
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            this.setToken(null);
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
            throw new Error(error.detail || 'Request failed');
        }

        return response.json();
    }

    // Auth
    async login(email: string, password: string) {
        const data = await this.request('/auth/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(data.access_token);
        return data;
    }

    logout() {
        this.setToken(null);
    }

    // Users
    async getUsers(skip = 0, limit = 50) {
        return this.request(`/users?skip=${skip}&limit=${limit}`);
    }

    async getUser(id: string) {
        return this.request(`/users/${id}`);
    }

    async deleteUser(id: string) {
        return this.request(`/users/${id}`, { method: 'DELETE' });
    }

    // Courses
    async getCourses() {
        return this.request('/courses/admin/all');
    }

    async getCourse(id: string) {
        return this.request(`/courses/${id}`);
    }

    async createCourse(data: { title: string; description: string; thumbnail?: string }) {
        return this.request('/courses', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateCourse(id: string, data: { title?: string; description?: string; thumbnail?: string; isActive?: boolean }) {
        return this.request(`/courses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteCourse(id: string) {
        return this.request(`/courses/${id}`, { method: 'DELETE' });
    }

    // Modules
    async addModule(courseId: string, data: { title: string; description?: string; order: number }) {
        return this.request(`/courses/${courseId}/modules`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteModule(courseId: string, moduleId: string) {
        return this.request(`/courses/${courseId}/modules/${moduleId}`, { method: 'DELETE' });
    }

    // Chapters
    async addChapter(courseId: string, moduleId: string, data: { title: string; type: string; content: string; duration?: number; order: number }) {
        return this.request(`/courses/${courseId}/modules/${moduleId}/chapters`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const api = new ApiClient();
