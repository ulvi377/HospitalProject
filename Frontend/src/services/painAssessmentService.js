
import api from "./api";

const painAssessmentService = {
  // Ağrı qiymətləndirmələrini gətir
  // patientId, painAreaId, isEmergency
  getAll: async (params = {}) => {
    const response = await api.get("/PainAssessment", {
      params,
    });

    return response.data;
  },

  // ID-yə görə ağrı qiymətləndirməsi
  getById: async (id) => {
    const response = await api.get(
      `/PainAssessment/${id}`,
    );

    return response.data;
  },

  // Həkim tövsiyəsini gətir
  getRecommendation: async (id) => {
    const response = await api.get(
      `/PainAssessment/${id}/recommendation`,
    );

    return response.data;
  },

  // Yeni ağrı qiymətləndirməsi yarat
  create: async (data) => {
    const response = await api.post(
      "/PainAssessment",
      data,
    );

    return response.data;
  },
};

export default painAssessmentService;
