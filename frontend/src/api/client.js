import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

const client = axios.create({
    baseURL: apiBase,
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

export default client;
