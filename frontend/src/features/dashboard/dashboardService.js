import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api/dashboard/';

const getAuthHeader = (token) => {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

const getDashboardSummary = async (token) => {
    const config = getAuthHeader(token);
    const response = await axios.get(API_URL + 'summary', config);
    return response.data;
};

// Updated to accept query params
const getRecentTransactions = async (token, params = {}) => {
    const config = getAuthHeader(token);
    // params can be { limit, type, sort, order, from, to }
    const response = await axios.get(API_URL + 'transactions', {
        ...config,
        params
    });
    return response.data;
};

const dashboardService = {
    getDashboardSummary,
    getRecentTransactions,
};

export default dashboardService;
