
import api from "./api";

const authService = {
  register: async (data) => {
    const response = await api.post("/Auth/register", data);
    return response.data;
  },

  login: async (data) => {
    const response = await api.post("/Auth/login", data);

    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  isAuthenticated: () => {
    return Boolean(localStorage.getItem("token"));
  },
};

export default authService;
 