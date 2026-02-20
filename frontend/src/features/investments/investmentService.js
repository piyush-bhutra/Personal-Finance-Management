import client from '../../api/client';

const API_URL = '/investments/';

/** Fetch all plans with computed totals */
const getInvestments = async () => {
    const response = await client.get(API_URL);
    return response.data;
};

/** Fetch aggregate summary for dashboard */
const getInvestmentSummary = async () => {
    const response = await client.get(API_URL + 'summary');
    return response.data;
};

/**
 * Create a new investment plan.
 */
const createInvestment = async (investmentData) => {
    const response = await client.post(API_URL, investmentData);
    return response.data;
};

/**
 * Update an investment plan.
 */
const updateInvestment = async (investmentId, investmentData) => {
    const response = await client.put(API_URL + investmentId, investmentData);
    return response.data;
};

/**
 * Delete an investment plan.
 */
const deleteInvestment = async (id, fromDate) => {
    const body = fromDate ? { data: { fromDate } } : {};
    const response = await client.delete(API_URL + id, body);
    return response.data;
};

const stopInvestment = async (id, data) => {
    // data: { stopDate, realizedValue }
    const response = await client.put(API_URL + id + '/stop', data);
    return response.data;
};

const investmentService = {
    getInvestments,
    getInvestmentSummary,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    stopInvestment,
};

export default investmentService;
