
import api from "./api";

const patientService = {
  getAll: async (params = {}) => {
    const response = await api.get("/Patient", {
      params,
    });

    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/Patient/${id}`);

    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/Patient", data);

    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/Patient/${id}`, data);

    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/Patient/${id}`);

    return response.data;
  },
};

export default patientService;
