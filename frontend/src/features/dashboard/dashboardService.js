import client from "../../api/client";

const API_URL = "/dashboard/";

const getDashboardSummary = async () => {
  const response = await client.get(API_URL + "summary");
  return response.data;
};

const getBudgets = async (params = {}) => {
  const response = await client.get(API_URL + "budgets", {
    params,
  });
  return response.data;
};

const upsertBudget = async (budgetData) => {
  const response = await client.post(API_URL + "budgets", budgetData);
  return response.data;
};

const deleteBudget = async (budgetId) => {
  const response = await client.delete(API_URL + "budgets/" + budgetId);
  return response.data;
};

const getRecentTransactions = async (params = {}) => {
  const response = await client.get(API_URL + "transactions", {
    params,
  });
  return response.data;
};

const dashboardService = {
  getDashboardSummary,
  getRecentTransactions,
  getBudgets,
  upsertBudget,
  deleteBudget,
};

export default dashboardService;
