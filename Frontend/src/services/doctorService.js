import api from "./api";

const doctorService = {
  getAll(params = {}) {
    return api.get("/Doctors", { params });
  },

  getById(id) {
    return api.get(`/Doctors/${id}`);
  },

  create(doctor) {
    return api.post("/Doctors", doctor);
  },

  update(id, doctor) {
    return api.put(`/Doctors/${id}`, {
      ...doctor,
      id,
    });
  },

  delete(id) {
    return api.delete(`/Doctors/${id}`);
  },

  uploadImage(id, file) {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`/Doctors/${id}/image`, formData, {
      headers: {
        "Content-Type": undefined,
      },
    });
  },
};

export default doctorService;