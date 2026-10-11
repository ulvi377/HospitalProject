import api from "./api";

const specialtyService = {
  getAll: async (params = {}) => {
    const response = await api.get("/Specialties", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/Specialties/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/Specialties", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/Specialties/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/Specialties/${id}`);
    return response.data;
  },
};

export default specialtyService;