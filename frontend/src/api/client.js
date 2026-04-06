import axios from 'axios';

const apiBase =
    import.meta.env.DEV || !import.meta.env.VITE_API_URL
        ? '/api'
        : `${import.meta.env.VITE_API_URL}/api`;

const client = axios.create({
    baseURL: apiBase,
    timeout: 10000, // 10 seconds — prevents indefinite hanging on slow responses
});

const getStoredUser = () => {
    try {
        const raw = localStorage.getItem('user');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        // Corrupt local storage should not break all API requests.
        localStorage.removeItem('user');
        return null;
    }
};

// Request interceptor to add auth token
client.interceptors.request.use(
    (config) => {
        const user = getStoredUser();
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle auth expiry gracefully
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // JWT expired or invalid — clear stale auth and force re-login
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default client;
