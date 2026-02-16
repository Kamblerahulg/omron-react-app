import { useEffect, useState } from "react";
import { Customer } from "../models/customer.model";
import { customerService } from "../services/customer.service";
import { MOCK_CUSTOMERS } from "../mocks/customer.mock";

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err) {
      console.warn("API failed. Using mock data.", err);
      setCustomers(MOCK_CUSTOMERS); // 👈 fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const getCustomerById = async (id: string) => {
    try {
      return await customerService.getById(id);
    } catch {
      return MOCK_CUSTOMERS.find(c => c.customer_id === id)!;
    }
  };

  const saveCustomer = async (payload: Customer, isEdit: boolean) => {
    try {
      const saved = isEdit
        ? await customerService.update(payload)
        : await customerService.create(payload);

      setCustomers(prev =>
        isEdit
          ? prev.map(c => c.customer_id === saved.customer_id ? saved : c)
          : [...prev, saved]
      );
    } catch {
      // offline save (mock)
      setCustomers(prev =>
        isEdit
          ? prev.map(c => c.customer_id === payload.customer_id ? payload : c)
          : [...prev, { ...payload, customer_id: Date.now().toString() }]
      );
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await customerService.toggleStatus(id);
    } catch {
      // local toggle
    }

    setCustomers(prev =>
      prev.map(c =>
        c.customer_id === id
          ? { ...c, status: c.status === "Active" ? "Deactive" : "Active" }
          : c
      )
    );
  };

  return {
    customers,
    loading,
    saveCustomer,
    toggleStatus,
    getCustomerById,
  };
};
