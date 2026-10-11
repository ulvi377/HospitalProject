
import api from "./api";

const prescriptionService = {
  // Bütün reseptlər
  // Yalnız Admin
  getAll: async () => {
    const response = await api.get("/Prescription");

    return response.data;
  },

  // ID-yə görə resept
  // Admin + Doctor + Patient
  getById: async (id) => {
    const response = await api.get(`/Prescription/${id}`);

    return response.data;
  },

  // Patient-in reseptləri
  // Admin + həmin Patient
  getByPatient: async (patientId) => {
    const response = await api.get(
      `/Prescription/patient/${patientId}`,
    );

    return response.data;
  },

  // Doctor-un yazdığı reseptlər
  // Admin + həmin Doctor
  getByDoctor: async (doctorId) => {
    const response = await api.get(
      `/Prescription/doctor/${doctorId}`,
    );

    return response.data;
  },

  // Yeni resept yarat
  // Admin + Doctor
  create: async (data) => {
    const response = await api.post(
      "/Prescription",
      data,
    );

    return response.data;
  },

  // Resepti yenilə
  // Admin + resepti yazan Doctor
  update: async (id, data) => {
    const response = await api.put(
      `/Prescription/${id}`,
      data,
    );

    return response.data;
  },

  // Resepti sil
  // Yalnız Admin
  delete: async (id) => {
    const response = await api.delete(
      `/Prescription/${id}`,
    );

    return response.data;
  },
};

export default prescriptionService;
