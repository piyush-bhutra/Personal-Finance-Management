import client from '../../api/client';

const API_URL = '/expenses/';

const getExpenses = async (params = {}) => {
    const response = await client.get(API_URL, { params });
    return response.data;
};

const createExpense = async (expenseData) => {
    const response = await client.post(API_URL, expenseData);
    return response.data;
};

const updateExpense = async (expenseId, expenseData) => {
    const response = await client.put(API_URL + expenseId, expenseData);
    return response.data;
};

const deleteExpense = async (expenseId, fromDate) => {
    const response = await client.delete(API_URL + expenseId, { data: { fromDate } });
    return response.data;
};

const stopExpense = async (expenseId, stopData) => {
    const response = await client.put(API_URL + expenseId + '/stop', stopData);
    return response.data;
};

const expenseService = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    stopExpense,
};

export default expenseService;
