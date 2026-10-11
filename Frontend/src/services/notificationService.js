
import api from "./api";

const notificationService = {
  getAll: async () => {
    const response = await api.get("/Notification");
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/Notification/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put("/Notification/read-all");
    return response.data;
  },
};

export default notificationService;
