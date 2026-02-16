const mockUsers = [
  {
    user_id: "1001",
    username: "John Doe",
    email: "john@example.com",
    status: "Active",
  },
  {
    user_id: "1002",
    username: "Jane Smith",
    email: "jane@example.com",
    status: "Inactive",
  },
];

export const mockAPI = {
  getAllUsers: async () => {
    return { items: mockUsers };
  },

  createUser: async (payload: any) => {
    mockUsers.push(payload);
    return { message: "User created (mock)", user_id: payload.user_id };
  },

  updateUser: async (id: string, payload: any) => {
    const index = mockUsers.findIndex(u => u.user_id === id);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...payload };
    }
    return { message: "User updated (mock)", user_id: id };
  },

  getUserById: async (id: string) => {
    const user = mockUsers.find(u => u.user_id === id);
    return user || null;
  },
};
