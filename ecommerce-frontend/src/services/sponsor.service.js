// File: ecommerce-frontend/src/services/sponsor.service.js
import api from "./api";

const sponsorService = {
  // Public: Get visible sponsors
  getVisibleSponsors: async () => {
    const response = await api.get("/sponsors");
    return response.data;
  },

  // Admin: Get all sponsors
  getAllSponsors: async () => {
    const response = await api.get("/sponsors/admin");
    return response.data;
  },

  // Admin: Create sponsor
  createSponsor: async (formData) => {
    const response = await api.post("/sponsors", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Admin: Update sponsor
  updateSponsor: async (id, formData) => {
    const response = await api.put(`/sponsors/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Admin: Delete sponsor
  deleteSponsor: async (id) => {
    const response = await api.delete(`/sponsors/${id}`);
    return response.data;
  },

  // Admin: Toggle sponsor visibility
  toggleSponsorVisibility: async (id) => {
    const response = await api.patch(`/sponsors/${id}/toggle-visibility`);
    return response.data;
  },
};

export default sponsorService;