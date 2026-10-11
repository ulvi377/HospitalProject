
import api from "./api";

const medicalRecordService = {
  // Bütün tibbi qeydlər
  // Yalnız Admin
  getAll: async () => {
    const response = await api.get("/MedicalRecord");

    return response.data;
  },

  // ID-yə görə tibbi qeyd
  // Admin + Doctor + Patient
  getById: async (id) => {
    const response = await api.get(
      `/MedicalRecord/${id}`,
    );

    return response.data;
  },

  // Patient-in tibbi qeydləri
  // Admin + həmin Patient
  getByPatient: async (patientId) => {
    const response = await api.get(
      `/MedicalRecord/patient/${patientId}`,
    );

    return response.data;
  },

  // Doctor-un tibbi qeydləri
  // Admin + həmin Doctor
  getByDoctor: async (doctorId) => {
    const response = await api.get(
      `/MedicalRecord/doctor/${doctorId}`,
    );

    return response.data;
  },

  // Yeni tibbi qeyd yarat
  // Admin + Doctor
  create: async (data) => {
    const response = await api.post(
      "/MedicalRecord",
      data,
    );

    return response.data;
  },

  // Tibbi qeydi yenilə
  // Admin + həmin qeydin sahibi Doctor
  update: async (id, data) => {
    const response = await api.put(
      `/MedicalRecord/${id}`,
      data,
    );

    return response.data;
  },

  // Tibbi qeydi sil
  // Yalnız Admin
  delete: async (id) => {
    const response = await api.delete(
      `/MedicalRecord/${id}`,
    );

    return response.data;
  },
};

export default medicalRecordService;
