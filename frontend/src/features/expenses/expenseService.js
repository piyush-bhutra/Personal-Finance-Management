import axios from 'axios';

const API_URL = '/api/expenses/';

// Get user expenses
const getExpenses = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.get(API_URL, config);

    return response.data;
};

// Create new expense
const createExpense = async (expenseData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.post(API_URL, expenseData, config);

    return response.data;
};

// Update user expense
const updateExpense = async (expenseId, expenseData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.put(API_URL + expenseId, expenseData, config);

    return response.data;

};

// Delete user expense
const deleteExpense = async (expenseId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.delete(API_URL + expenseId, config);

    return response.data;
};

const expenseService = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
};

export default expenseService;
