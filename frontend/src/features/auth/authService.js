import client from '../../api/client';

const API_URL = '/users/';

const register = async (userData) => {
    const response = await client.post(API_URL, userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

const login = async (userData) => {
    const response = await client.post(API_URL + 'login', userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const updateProfile = async (userData) => {
    const response = await client.put(API_URL + 'profile', userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

const authService = {
    register,
    logout,
    login,
    updateProfile,
};

export default authService;
