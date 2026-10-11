
import api from "./api";

const doctorScheduleService = {
  // Bütün həkim qrafikləri
  getAll: async () => {
    const response = await api.get("/DoctorSchedule");

    return response.data;
  },

  // ID-yə görə qrafik
  getById: async (id) => {
    const response = await api.get(
      `/DoctorSchedule/${id}`,
    );

    return response.data;
  },

  // Müəyyən həkimin qrafikləri
  getByDoctor: async (doctorId) => {
    const response = await api.get(
      `/DoctorSchedule/doctor/${doctorId}`,
    );

    return response.data;
  },

  // Yeni qrafik yarat
  create: async (data) => {
    const response = await api.post(
      "/DoctorSchedule",
      data,
    );

    return response.data;
  },

  // Qrafiki yenilə
  update: async (id, data) => {
    const response = await api.put(
      `/DoctorSchedule/${id}`,
      data,
    );

    return response.data;
  },

  // Qrafiki sil
  delete: async (id) => {
    const response = await api.delete(
      `/DoctorSchedule/${id}`,
    );

    return response.data;
  },
};

export default doctorScheduleService;
