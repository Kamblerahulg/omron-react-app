import axios from "axios";

export const realAPI = {
  getAllUsers: async () => {
    const res = await axios.get("/users");
    return res.data;
  },

  createUser: async (payload: any) => {
    const res = await axios.post("/users", payload);
    return res.data;
  },

  updateUser: async (id: string, payload: any) => {
    const res = await axios.put(`/users/${id}`, payload);
    return res.data;
  },

  getUserById: async (id: string) => {
    const res = await axios.get(`/users/${id}`);
    return res.data;
  },
};
