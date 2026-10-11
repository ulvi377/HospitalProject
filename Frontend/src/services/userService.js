import api from "./api";

const userService = {
  getAll: async () => (await api.get("/Admin/users")).data,

  assignRole: async (email, role) =>
    (await api.post("/Admin/assign-role", { email, role })).data,

  changePassword: async (id, newPassword) =>
    (
      await api.put(`/Admin/users/${id}/password`, {
        newPassword,
      })
    ).data,

  deleteUser: async (id) =>
    (await api.delete(`/Admin/users/${id}`)).data,
};

export default userService;