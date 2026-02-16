import axios from "axios";
import { Customer } from "../models/customer.model";

const BASE_URL = "/customers/config";

export const customerService = {
  /** List All Configurations */
  getAll: async (): Promise<Customer[]> => {
    const res = await axios.get<Customer[]>(BASE_URL); // ✅ FIXED
    return res.data;
  },

  /** Get Configuration by ID */
  getById: async (customer_id: string): Promise<Customer> => {
    const res = await axios.get<Customer>(
      `${BASE_URL}/${customer_id}`
    );
    return res.data;
  },

  /** Create Configuration */
  create: async (payload: Customer): Promise<Customer> => {
    const res = await axios.post<Customer>(BASE_URL, payload); // ✅ FIXED
    return res.data;
  },

  /** Update Configuration */
  update: async (payload: Customer): Promise<Customer> => {
    const res = await axios.put<Customer>(
      `${BASE_URL}/${payload.customer_id}`,
      payload
    );
    return res.data;
  },

  /** Activate / Deactivate */
  toggleStatus: async (id: string): Promise<void> => {
    await axios.patch(`${BASE_URL}/${id}/status`);
  },
};
