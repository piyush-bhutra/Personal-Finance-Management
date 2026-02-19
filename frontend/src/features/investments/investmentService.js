import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api/investments/';

const authHeader = (token) => ({
    headers: { Authorization: `Bearer ${token}` },
});

/** Fetch all plans with computed totals */
const getInvestments = async (token) => {
    const response = await axios.get(API_URL, authHeader(token));
    return response.data;
};

/** Fetch aggregate summary for dashboard */
const getInvestmentSummary = async (token) => {
    const response = await axios.get(API_URL + 'summary', authHeader(token));
    return response.data;
};

/**
 * Create a new investment plan.
 * investmentData should include:
 *   investmentMode: 'recurring' | 'one-time'
 *   For recurring: assetName, type, monthlyAmount, startDate, expectedReturnRate?, description?
 *   For one-time:  assetName, type, amount, date, expectedReturnRate?, description?
 */
const createInvestment = async (investmentData, token) => {
    const response = await axios.post(API_URL, investmentData, authHeader(token));
    return response.data;
};

/**
 * Update an investment plan.
 * For recurring: include fromDate (YYYY-MM) to indicate which month the change applies from.
 * All entries from that month forward are replaced; earlier entries are preserved.
 */
const updateInvestment = async (investmentId, investmentData, token) => {
    const response = await axios.put(API_URL + investmentId, investmentData, authHeader(token));
    return response.data;
};

/**
 * Delete an investment plan.
 * For recurring: include fromDate (YYYY-MM) in the body.
 *   Only entries from that month forward are deactivated (history preserved).
 * For one-time: the entire plan and its entry are removed.
 */
const deleteInvestment = async (token, id, fromDate) => {
    const config = authHeader(token);
    const body = fromDate ? { data: { fromDate } } : {};
    const response = await axios.delete(API_URL + id, { ...config, ...body });
    return response.data;
};

const stopInvestment = async (token, id, data) => {
    const config = authHeader(token);
    // data: { stopDate, realizedValue }
    const response = await axios.put(API_URL + id + '/stop', data, config);
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
