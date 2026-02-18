import api from "./api";

const authService = {
  login: (email, password) => {
    return api.post("/auth/login", { email, password });
  },

  register: (userData) => {
    return api.post("/auth/register", userData);
  },

  // Add Google authentication
  googleLogin: (idToken) => {
    return api.post("/auth/google", { idToken });
  },

  getProfile: () => {
    return api.get("/auth/profile");
  },

  createAdmin: (adminData) => {
    return api.post("/admin/users", adminData);
  },

  getAllUsers: () => {
    return api.get("/admin/users");
  },

  toggleUserBan: (userId, data = {}) => {
    return api.put(`/admin/users/${userId}/ban`, data);
  },

  updateProfile: (userData) => {
    return api.put("/auth/profile", userData);
  },

  deleteUser: (userId) => {
    return api.delete(`/admin/users/${userId}`);
  },

  changePassword: (newPassword) => {
    return api.post("/auth/change-password", { newPassword });
  },
};

export default authService;
