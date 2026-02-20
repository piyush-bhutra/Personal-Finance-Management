import axios from 'axios';

const client = axios.create({
    baseURL: (import.meta.env.VITE_API_BASE_URL || '') + '/api',
});

// Request interceptor to add auth token
client.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default client;
