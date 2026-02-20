import client from '../../api/client';

const API_URL = '/dashboard/';

const getDashboardSummary = async () => {
    const response = await client.get(API_URL + 'summary');
    return response.data;
};

// Updated to accept query params
const getRecentTransactions = async (params = {}) => {
    // params can be { limit, type, sort, order, from, to }
    const response = await client.get(API_URL + 'transactions', {
        params
    });
    return response.data;
};

const dashboardService = {
    getDashboardSummary,
    getRecentTransactions,
};

export default dashboardService;
