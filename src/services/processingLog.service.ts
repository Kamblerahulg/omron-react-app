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

      // 🔥 MAP API RESPONSE TO UI MODEL
      const mappedData: ProcessingLog[] = response.map((item: any) => ({
        id: item.id,
        log_id: item.id,

        file_name: item.file_name,
        entity: item.entity,

        status: item.status,
        processing_status: item.status,

        customer_name: item.customer_name,
        customer_po_no: item.customer_po_number,
        salesorder_no: item.salesorder_number,

        processing_date: item.created_date,

        reviewed_by: item.reviewed_by ?? "",
        reviewed_timestamp: item.reviewed_date ?? "",
      }));

      return mappedData;
    } catch (error) {
      console.warn("⚠️ file-log API failed, using mock", error);
      return MOCK_PROCESSING_LOGS;
    }
  },


  /* 🔹 GET DETAILS */
  getDetailByLogId: async (logId: string) => {
    try {
      const res = await callApi({
        url: `file-log/${logId}`,
        method: "GET",
        requiresAuth: true,
      });

      return res;
    } catch (error) {
      console.warn(`⚠️ detail API failed for ${logId}`, error);
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
    const res = await callApi({
      url: "file-log",
      method: "POST",
      data: payload,
      requiresAuth: true,
    });

    return res;
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
    try {
      const res = await callApi({
        url: `salesorders/processing-log/${logId}`,
        method: "PUT",
        data: payload,
        requiresAuth: true,
      });

      return res;
    } catch (error) {
      console.warn("⚠️ updateProcessingStatus API failed", error);
      return {
        message: "mock update success",
        log_id: logId,
      };
    }
  },
};
