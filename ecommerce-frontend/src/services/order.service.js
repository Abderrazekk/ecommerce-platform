import api from "./api";

const orderService = {
  createOrder: (orderData) => {
    return api.post("/orders", orderData);
  },

  getMyOrders: () => {
    return api.get("/orders/my");
  },

  getOrder: (id) => {
    return api.get(`/orders/${id}`);
  },

  getAllOrders: () => {
    return api.get("/admin/orders");
  },

  updateOrderStatus: (id, status) => {
    return api.put(`/admin/order/${id}/status`, { status });
  },

  // NEW: Delete order (admin)
  deleteOrder: (id) => {
    return api.delete(`/admin/orders/${id}`);
  },

  getDashboardStats: () => {
    return api.get("/admin/dashboard");
  },
};

export default orderService;
