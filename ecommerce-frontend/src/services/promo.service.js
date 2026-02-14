import api from "./api";

const promoService = {
  // Get active promo (public)
  getActivePromo: async () => {
    const response = await api.get("/promo");
    return response.data;
  },

  // Create new promo (admin)
  createPromo: async (formData) => {
    const response = await api.post("/promo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update promo (admin)
  updatePromo: async (id, formData) => {
    const response = await api.put(`/promo/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Delete promo (admin)
  deletePromo: async (id) => {
    const response = await api.delete(`/promo/${id}`);
    return response.data;
  },
};

export default promoService;