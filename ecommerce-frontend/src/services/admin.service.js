import api from './api';

const adminService = {
  // Get comprehensive analytics
  getAnalytics: async (period = 'month') => {
    const response = await api.get(`/admin/dashboard/analytics?period=${period}`);
    return response.data;
  },

  // Export analytics data
  exportData: async (format = 'csv', type = 'summary', startDate, endDate) => {
    const params = { format, type };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get(`/admin/dashboard/export`, {
      params,
      responseType: format === 'pdf' ? 'blob' : 'text'
    });
    return response.data;
  },

  // Get revenue report with filters
  getRevenueReport: async (startDate, endDate, groupBy = 'day') => {
    const response = await api.get(`/admin/dashboard/revenue-report`, {
      params: { startDate, endDate, groupBy }
    });
    return response.data;
  },

  // Get product performance
  getProductPerformance: async (productId, period = 'month') => {
    const response = await api.get(`/admin/dashboard/product-performance/${productId}`, {
      params: { period }
    });
    return response.data;
  },

  // Get user metrics
  getUserMetrics: async (period = 'month') => {
    const response = await api.get(`/admin/dashboard/user-metrics`, {
      params: { period }
    });
    return response.data;
  },

  // Get inventory analytics
  getInventoryAnalytics: async () => {
    const response = await api.get(`/analytics/inventory`);
    return response.data;
  },

  // Get conversion analytics
  getConversionAnalytics: async () => {
    const response = await api.get(`/analytics/conversion`);
    return response.data;
  },

  // Get top products
  getTopProducts: async (limit = 10) => {
    const response = await api.get(`/analytics/top-products`, {
      params: { limit }
    });
    return response.data;
  },

  // Get orders by status
  getOrdersByStatus: async () => {
    const response = await api.get(`/analytics/orders-by-status`);
    return response.data;
  }
};

export default adminService;