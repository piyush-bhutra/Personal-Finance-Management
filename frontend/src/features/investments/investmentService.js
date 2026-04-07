import client from '../../api/client';

const API_URL = '/investments/';

const getInvestments = async (params = {}) => {
    const response = await client.get(API_URL, { params });
    return response.data;
};

const getInvestmentSummary = async () => {
    const response = await client.get(API_URL + 'summary');
    return response.data;
};

const createInvestment = async (investmentData) => {
    const response = await client.post(API_URL, investmentData);
    return response.data;
};

const updateInvestment = async (investmentId, investmentData) => {
    const response = await client.put(API_URL + investmentId, investmentData);
    return response.data;
};

const deleteInvestment = async (id, fromDate) => {
    const body = fromDate ? { data: { fromDate } } : {};
    const response = await client.delete(API_URL + id, body);
    return response.data;
};

const stopInvestment = async (id, data) => {
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
