import { realAPI } from "./user.api";
import { mockAPI } from "./user.mock";

const USE_MOCK = false; // 🔥 switch when backend ready

export const getAllUsers = async () => {
  try {
    if (USE_MOCK) return mockAPI.getAllUsers();
    return await realAPI.getAllUsers();
  } catch (error) {
    console.warn("API failed. Falling back to mock data.");
    return mockAPI.getAllUsers();
  }
};

export const createUser = async (payload: any) => {
  try {
    if (USE_MOCK) return mockAPI.createUser(payload);
    return await realAPI.createUser(payload);
  } catch (error) {
    console.warn("API failed. Using mock create.");
    return mockAPI.createUser(payload);
  }
};

export const updateUser = async (id: string, payload: any) => {
  try {
    if (USE_MOCK) return mockAPI.updateUser(id, payload);
    return await realAPI.updateUser(id, payload);
  } catch (error) {
    console.warn("API failed. Using mock update.");
    return mockAPI.updateUser(id, payload);
  }
};

export const getUserById = async (userId: string) => {
  try {
    if (USE_MOCK) return mockAPI.getUserById(userId);

    return await realAPI.getUserById(userId);
  } catch (error) {
    console.warn("API failed. Using mock getUserById.");
    return mockAPI.getUserById(userId);
  }
};
