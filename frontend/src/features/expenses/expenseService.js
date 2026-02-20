import client from '../../api/client';

const API_URL = '/expenses/';

// Get user expenses
const getExpenses = async () => {
    const response = await client.get(API_URL);
    return response.data;
};

// Create new expense
const createExpense = async (expenseData) => {
    const response = await client.post(API_URL, expenseData);
    return response.data;
};

// Update user expense
const updateExpense = async (expenseId, expenseData) => {
    const response = await client.put(API_URL + expenseId, expenseData);
    return response.data;
};

// Delete user expense
const deleteExpense = async (expenseId) => {
    const response = await client.delete(API_URL + expenseId);
    return response.data;
};

const expenseService = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
};

export default expenseService;
