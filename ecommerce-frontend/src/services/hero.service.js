import api from "./api";

const heroService = {
  // Get active hero for homepage (public)
  getActiveHero: async () => {
    const response = await api.get("/hero");
    return response.data;
  },

  // Get all heroes (admin)
  getAllHeroes: async (page = 1, limit = 10) => {
    const response = await api.get("/hero/admin", {
      params: { page, limit },
    });
    return response.data;
  },

  // Get hero by ID (admin)
  getHeroById: async (id) => {
    const response = await api.get(`/hero/admin/${id}`);
    return response.data;
  },

  // Create new hero (admin)
  createHero: async (formData) => {
    const response = await api.post("/hero/admin", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update hero (admin)
  updateHero: async (id, formData) => {
    const response = await api.put(`/hero/admin/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete hero (admin)
  deleteHero: async (id) => {
    const response = await api.delete(`/hero/admin/${id}`);
    return response.data;
  },

  // Set hero as active (admin) - simplified
  setActiveHero: async (id) => {
    // First get the hero to update it
    const hero = await heroService.getHeroById(id);
    const formData = new FormData();
    formData.append("title", hero.data.title);
    formData.append("subtitle", hero.data.subtitle || "");
    formData.append("season", hero.data.season);
    formData.append("isActive", "true");

    const response = await heroService.updateHero(id, formData);
    return response.data;
  },
};

export default heroService;
