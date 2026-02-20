import axios from 'axios';

console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
const client = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
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
    (error) => Promise.reject(error)
);

export default client;