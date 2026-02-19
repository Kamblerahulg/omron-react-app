import axios from "axios";
import { ProcessingLog } from "../models/processingLog.model";
import { MOCK_PROCESSING_LOGS } from "../mocks/processingLog.mock";
import { MOCK_PROCESSING_LOG_DETAILS } from "../mocks/processingLogDetail.mock";
import { callApi } from "../api/api.util";

/* ============================= */
/* 🔹 MAIN SERVICE OBJECT */
/* ============================= */
export const processingLogService = {
  /* 🔹 LIST FILE LOGS (SECURED) */
list: async (): Promise<ProcessingLog[]> => {
  try {
    const response = await callApi({
      url: "file-log",
      method: "GET",
      requiresAuth: true,
    });

    if (!response || !Array.isArray(response)) {
      return MOCK_PROCESSING_LOGS;
    }

    const ENTITY_MAP: Record<number, string> = {
      1: "India",
      2: "Singapore",
      3: "Japan",
      4: "Malaysia",
    };

    const CUSTOMER_MAP: Record<number, string> = {
      1: "Tata Motors",
      2: "Infosys",
      3: "Reliance",
    };

    return response.map((item: any) => ({
      id: item.id,
      log_id: item.id,
      file_name: item.file_name,

      // 🔥 FIXED FIELDS
      entity: ENTITY_MAP[item.entity_id] ?? `Entity ${item.entity_id}`,
      customer_name: CUSTOMER_MAP[item.customer_id] ?? `Customer ${item.customer_id}`,

      status: item.status,
      processing_status: item.status,

      customer_po_no: item.customer_po_number,
      salesorder_no: item.salesorder_number,
      salesorder_id: item.salesorder_number,

      processing_date: item.created_date,

      reviewed_by: item.reviewed_by ?? "",
      reviewed_timestamp: item.reviewed_date ?? "",
    }));

  } catch (error) {
    console.error("API failed, using mock", error);
    return MOCK_PROCESSING_LOGS;
  }
},
  /* 🔹 GET DETAILS */
  getDetailByLogId: async (logId: string) => {
    console.log(`🔹 getDetailByLogId called for logId=${logId}`);
    try {
      const res = await callApi({
        url: `file-log/${logId}`,
        method: "GET",
        requiresAuth: true,
      });

      if (!res) {
        console.warn(`⚠️ detail API returned empty for ${logId}`);
        return MOCK_PROCESSING_LOG_DETAILS[logId];
      }

      return res;
    } catch (error) {
      console.error(`❌ detail API failed for ${logId}`, error);
      return MOCK_PROCESSING_LOG_DETAILS[logId];
    }
  },

  /* 🔥 POST TO JDE */
  createProcessingLog: async (payload: {
    salesorder_id: string;
    customer_name: string;
    file_name: string;
    processing_status: string;
    reviewed_by: string;
    reviewed_timestamp: string;
  }) => {
    console.log("🔹 createProcessingLog called", payload);
    try {
      const res = await callApi({
        url: "file-log",
        method: "POST",
        data: payload,
        requiresAuth: true,
      });

      return res;
    } catch (error) {
      console.error("❌ createProcessingLog API failed", error);
      return { message: "mock create success" };
    }
  },

  /* 🔁 UPDATE PROCESSING STATUS */
  updateProcessingStatus: async (
    logId: string,
    payload: {
      processing_status: string;
      salesorder_number: string;
      requested_date: string;
    }
  ) => {
    console.log("🔹 updateProcessingStatus called", logId, payload);
    try {
      const res = await callApi({
        url: `salesorders/processing-log/${logId}`,
        method: "PUT",
        data: payload,
        requiresAuth: true,
      });

      return res;
    } catch (error) {
      console.error("❌ updateProcessingStatus API failed", error);
      return {
        message: "mock update success",
        log_id: logId,
      };
    }
  },
};
