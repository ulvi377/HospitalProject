import api from "./api";

const painAreaService = {
  getAll: async (params = {}) => (await api.get("/PainArea", { params })).data,
  getById: async (id) => (await api.get(`/PainArea/${id}`)).data,
  create: async (data) => (await api.post("/PainArea", data)).data,
  update: async (id, data) => (await api.put(`/PainArea/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/PainArea/${id}`)).data,
};

export default painAreaService;