import axios from 'axios';

const API_URL = '/api/investments/';

// Get user investments
const getInvestments = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.get(API_URL, config);

    return response.data;
};

// Create new investment
const createInvestment = async (investmentData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.post(API_URL, investmentData, config);

    return response.data;
};

// Update user investment
const updateInvestment = async (investmentId, investmentData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.put(API_URL + investmentId, investmentData, config);

    return response.data;
};

// Delete user investment
const deleteInvestment = async (investmentId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.delete(API_URL + investmentId, config);

    return response.data;
};

const investmentService = {
    getInvestments,
    createInvestment,
    updateInvestment,
    deleteInvestment,
};

export default investmentService;
