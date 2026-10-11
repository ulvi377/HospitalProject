
import api from "./api";

const appointmentService = {
  // Bütün appointment-lər
  // params: status, doctorId, patientId
  getAll: async (params = {}) => {
    const response = await api.get("/Appointment", {
      params,
    });

    return response.data;
  },

  // ID-yə görə appointment
  getById: async (id) => {
    const response = await api.get(`/Appointment/${id}`);

    return response.data;
  },

  // Patient-in appointment-ləri
  getByPatient: async (patientId) => {
    const response = await api.get(
      `/Appointment/patient/${patientId}`,
    );

    return response.data;
  },

  // Doctor-un appointment-ləri
  getByDoctor: async (doctorId) => {
    const response = await api.get(
      `/Appointment/doctor/${doctorId}`,
    );

    return response.data;
  },

  // Yeni appointment yarat
  create: async (data) => {
    const response = await api.post("/Appointment", data);

    return response.data;
  },

  // Appointment yenilə
  update: async (id, data) => {
    const response = await api.put(
      `/Appointment/${id}`,
      data,
    );

    return response.data;
  },

  // Appointment sil - yalnız Admin
  delete: async (id) => {
    const response = await api.delete(
      `/Appointment/${id}`,
    );

    return response.data;
  },
};

export default appointmentService;
