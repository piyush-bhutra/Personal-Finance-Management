import axios from 'axios';

const apiBase =
    import.meta.env.DEV || !import.meta.env.VITE_API_URL
        ? '/api'
        : `${import.meta.env.VITE_API_URL}/api`;

const client = axios.create({
    baseURL: apiBase,
    timeout: 10000,
});

const getStoredUser = () => {
    try {
        const raw = localStorage.getItem('user');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        localStorage.removeItem('user');
        return null;
    }
};

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

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default client;
