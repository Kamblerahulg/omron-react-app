import { useEffect, useState } from "react";
import { ProcessingLog } from "../models/processingLog.model";
import { processingLogService } from "../services/processingLog.service";
import { MOCK_PROCESSING_LOGS } from "../mocks/processingLog.mock";

export const useProcessingLogs = (filters: {
  customer?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await processingLogService.list({
        customer_name: filters.customer,
        status: filters.status,
        start_date: filters.startDate,
        end_date: filters.endDate,
      });
      setLogs(data);
      setUsingMock(false);
    } catch (err) {
      console.warn("Processing log API failed. Using mock data.", err);
      setLogs(MOCK_PROCESSING_LOGS);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [
    filters.customer,
    filters.status,
    filters.startDate,
    filters.endDate,
  ]);

  const postToJDE = async (rows: ProcessingLog[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          processingLogService.create({
            salesorder_id: r.salesorder_id,
            customer_name: r.customer_name,
            file_name: r.file_name,
            processing_status: "JDE-Success",
            reviewed_by: "System",
            reviewed_timestamp: new Date().toISOString(),
          })
        )
      );
    } catch {
      console.warn("Post to JDE failed (mock mode)");
    }
  };

  return {
    logs,
    loading,
    usingMock,
    postToJDE,
  };
};
