import axios from "axios";
import { ProcessingLog } from "../models/processingLog.model";
import { MOCK_PROCESSING_LOGS } from "../mocks/processingLog.mock";
import { MOCK_PROCESSING_LOG_DETAILS } from "../mocks/processingLogDetail.mock";
import { callApi } from "../api/api.util";

const BASE_URL = "/salesorders/processing-log";

export const processingLogService = {
  list: async () => {
    try {
      const res = await axios.get<ProcessingLog[]>(BASE_URL);
      return res.data;
    } catch {
      return MOCK_PROCESSING_LOGS;
    }
  },

  getDetailByLogId: async (logId: string) => {
    try {
      const res = await axios.get(`${BASE_URL}/${logId}`);
      return res.data;
    } catch (error) {
      console.warn(`⚠️ detail API failed for ${logId}`, error);
      return MOCK_PROCESSING_LOG_DETAILS[logId];
    }
  },

  /** 🔥 POST TO JDE (Create Processing Log) */
  createProcessingLog: async (payload: {
    salesorder_id: string;
    customer_name: string;
    file_name: string;
    processing_status: string;
    reviewed_by: string;
    reviewed_timestamp: string;
  }) => {
    const res = await axios.post(BASE_URL, payload);
    return res.data;
  },
  /** 🔁 UPDATE PROCESSING STATUS (Approve / Reject) */
  updateProcessingStatus: async (
    logId: string,
    payload: {
      processing_status: string;
      salesorder_number: string;
      requested_date: string;
    }
  ) => {
    try {
      const res = await axios.put(
        `/salesorders/processing-log/${logId}`,
        payload
      );
      return res.data;
    } catch (error) {
      console.warn("⚠️ updateProcessingStatus API failed", error);
      return {
        message: "mock update success",
        log_id: logId,
      };
    }
  },

};


export const getFileLogs = async () => {
  return callApi({
    url: "file-log",
    method: "GET",
    requiresAuth: true, // 🔥 This attaches Bearer + Private Key
  });
};
