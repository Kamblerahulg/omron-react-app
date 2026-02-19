import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Autocomplete,
  Tooltip,
  IconButton,
  DialogContent,
  Dialog,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useEffect } from "react";
import { processingLogService }
  from "../services/processingLog.service";

import { ProcessingLog }
  from "../models/processingLog.model";
import { MOCK_PROCESSING_LOGS } from "../mocks/processingLog.mock";

const STATUS_OPTIONS = [
  "NEW",
  "Pending Approval",
  "Approved",
  "JDE-Success",
  "JDE-Error",
  "Duplicate",
  "Reject",
];
// const auditHistory = [
//   {
//     date: "26-01-2026",
//     action: "Auto Approve",
//     status: "Approved",
//     user: "System",
//     pcsinfo: "Primary CS1111",
//     scsinfo: "Secondary CSS",
//     remark: "Auto approved after reconciliation",
//   }
// ];
const Dashboard = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ProcessingLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingMock, setUsingMock] = useState(false);

  // 🔹 Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customer, setCustomer] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerInput, setCustomerInput] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);

  const [status, setStatus] = useState("Pending Approval");
  const [salesOrder, setSalesOrder] = useState("");
  const [entity, setEntity] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [auditOpen, setAuditOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [detailCache, setDetailCache] = useState<Record<string, any>>({});
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  const [fileLogs, setFileLogs] = useState<any[]>([]);
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenAudit = (row: any) => {
    setSelectedAudit(row);
    setAuditOpen(true);
  };


  const compactFilter = {
    width: 110,

    "& .MuiInputLabel-root": {
      fontSize: 10,
    },

    "& .MuiOutlinedInput-root": {
      height: 30,
      fontSize: 11,
      backgroundColor: "#fff",

      "& fieldset": {
        borderColor: "#E5E7EB",
      },
    },

    "& .MuiOutlinedInput-input": {
      padding: "4px 8px",
      fontSize: 11,
    },
  };

  const fetchMoreDetails = async (logId: string) => {
  if (detailCache[logId]) return;

  setLoadingDetail(logId);

  try {
    const data = filteredRows.find(
      (item: any) => item.log_id == logId
    ); // ✅ use find instead of filter

    setDetailCache((prev) => ({
      ...prev,
      [logId]: data,
    }));

  } catch (err) {
    console.error(err);
  } finally {
    setLoadingDetail(null);
  }
};

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        // Fetch from the API
        console.log("Dashboard- A")
        const data = await processingLogService.list();
        setRows(data);
        console.log(data)
        setUsingMock(false);
      } catch (error) {
        console.error("API failed, using dummy data", error);
        // setRows(MOCK_PROCESSING_LOGS);
        setUsingMock(true);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  // 🔹 Customer dropdown (DynamoDB – logged-in user scope)
  const customerList = ["Tata Motors", "Infosys", "Reliance"]; // map from API
  const entityList = ["India", "Singapore", "Japan", "Malaysia"]; // map from API
  const [customerType, setCustomerType] = useState("ALL"); // default
  const [salesOrderNo, setSalesOrderNo] = useState("");
  const [customerPONo, setCustomerPONo] = useState("");

  // 🔹 Filter logic
  const primaryCustomers = ["TCS", "Infosys", "Wipro"];
  const secondaryCustomers = ["Accenture", "Capgemini"];

  const filteredRows = useMemo(() => {
    return rows?.filter((r) => {
      const matchesCustomer =
        !customer || r.customer_name === customer;

      const matchesEntity =
        !entity || r.entity === entity;

      const matchesStatus =
        !status || r.processing_status === status;
      const matchesCustomerPo =
        !customerPONo ||
        r.customer_po_no
          ?.toLowerCase()
          .includes(customerPONo.toLowerCase());

      const matchesSalesOrder =
        !salesOrderNo ||
        r.salesorder_no
          ?.toLowerCase()
          .includes(salesOrderNo.toLowerCase());

      const matchesCustomerType =
        customerType === "ALL" ||
        (customerType === "PRIMARY" &&
          primaryCustomers.includes(r.customer_name)) ||
        (customerType === "SECONDARY" &&
          secondaryCustomers.includes(r.customer_name));

      return (
        matchesCustomer &&
        matchesEntity &&
        matchesStatus &&
        matchesCustomerPo &&
        matchesSalesOrder &&
        matchesCustomerType
      );
    });
  }, [
    rows,
    customer,
    entity,
    status,
    customerPONo,
    salesOrderNo,
    customerType,
  ]);
  console.log(filteredRows)

  const handlePostOrders = async () => {
    try {
      setLoading(true);

      const approvedRows = filteredRows?.filter(
        (r) => r.processing_status === "Approved"
      );

      if (!approvedRows?.length) return;

      await Promise.all(
        approvedRows?.map((row) =>
          processingLogService.createProcessingLog({
            salesorder_id: row.salesorder_no,
            customer_name: row.customer_name,
            file_name: row.file_name,
            processing_status: "JDE-Success",
            reviewed_by: "System", // or logged-in user
            reviewed_timestamp: new Date().toISOString(),
          })
        )
      );

      alert("✅ Orders successfully posted to JDE");
      const data = await processingLogService.list();
      setRows(data);
    } catch (error) {
      console.error("❌ Post to JDE failed", error);
      alert("Failed to post orders to JDE");
    } finally {
      setLoading(false);
    }
  };
  const DATE_WIDTH = 140;
  const NORMAL_WIDTH = 150;
  const SMALL_WIDTH = 120;

  const handleExportCSV = () => {
    if (filteredRows?.length === 0) return;

    // Define table headers (matching your visible table columns)
    const headers = [
      "Processed Date",
      "Entity",
      "Customer Name",
      "Customer PO #",
      "Sales Order #",
      "Status",
      "Review Data",
      "File Name",
    ];

    // Map rows to CSV format
    const csvRows = filteredRows?.map((row) => [
      row.processing_date,
      row.entity,
      row.customer_name,
      row.customer_po_no,
      row.salesorder_no,
      row.status,
      row.file_name,           // you can change to a review data field if needed
      row.file_name,           // or include both file_name & review info
    ]);

    // Convert to CSV string
    const csvContent = [headers, ...csvRows]
      .map((e) => e.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    // Create blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `DocuBot_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Typography
        fontFamily={`"Shorai Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`}
        fontSize={18}
        fontWeight={600}
        mb={1}
      >
        OCB - Sales Order Processing Dashboard
      </Typography>

      {/* ================= Filters ================= */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
          p: 1,
          borderRadius: 2,
          background: "#fff",
          border: "1px solid #E5E7EB",
          overflowX: "auto",     // scroll instead of wrap
          whiteSpace: "nowrap",  // force single row
          flexWrap: "nowrap",    // NEVER wrap
        }}
      >
        {/* Start Date */}
        <TextField
          type="date"
          size="small"
          label="Start Date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{ ...compactFilter, width: DATE_WIDTH }}
        />


        {/* End Date */}
        <TextField
          type="date"
          size="small"
          label="End Date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={{ ...compactFilter, width: DATE_WIDTH }}
        />
        {/* Entity */}
        <Select
          size="small"
          value={entity}
          displayEmpty
          onChange={(e) => setEntity(e.target.value)}
          sx={{ ...compactFilter, width: NORMAL_WIDTH }}
        >
          <MenuItem value="">
            All Entity
          </MenuItem>
          {entityList.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
        {/* Customer */}
        <Autocomplete
          size="small"
          options={customerList}
          sx={{ width: 180 }}   // slightly bigger like OMI
          open={customerOpen}
          inputValue={customerInput}
          onInputChange={(event, newInputValue) => {
            setCustomerInput(newInputValue);
            setCustomerOpen(newInputValue.length > 0);
            setCustomerSearch(newInputValue);
          }}
          onClose={() => setCustomerOpen(false)}
          getOptionLabel={(option) => option}
          filterOptions={(options, { inputValue }) => {
            const normalizedInput = inputValue
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase();

            return options.filter((option) => {
              const normalizedOption = option
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
              return normalizedOption.includes(normalizedInput);
            });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Customer Name"
              placeholder="Type Customer name..."
              size="small"
              sx={{
                ...compactFilter,
                minWidth: 160,
              }}

              InputLabelProps={{
                shrink: true,
              }}
            />
          )}
          PaperComponent={(props) => (
            <div
              {...props}
              style={{
                ...props.style,
                borderRadius: 8,
                boxShadow: "0px 2px 8px rgba(0,0,0,0.2)",
                backgroundColor: "#fff",
                color: "#000",
              }}
            />
          )}
          ListboxProps={{
            style: {
              maxHeight: 200,
              fontSize: 14,
              padding: 0,
            },
          }}
          renderOption={(props, option) => (
            <li
              {...props}
              style={{
                padding: "8px 12px",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {option}
            </li>
          )}
        />
        {/* Status */}
        <Select
          size="small"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ ...compactFilter, width: SMALL_WIDTH }}
        >
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
        {/* Customer PO No */}
        <TextField
          size="small"
          label="Customer PO #."
          value={customerPONo}
          onChange={(e) => setCustomerPONo(e.target.value)}
          sx={{ ...compactFilter, width: SMALL_WIDTH }}
        />
        {/* Sales Order No */}
        <TextField
          size="small"
          label="Sales Order #"
          value={salesOrderNo}
          onChange={(e) => setSalesOrderNo(e.target.value)}
          sx={{ ...compactFilter, width: SMALL_WIDTH }}
        />

        {/* Customer Type */}
        <Select
          size="small"
          value={customerType}
          onChange={(e) => setCustomerType(e.target.value)}
          sx={{ ...compactFilter, width: SMALL_WIDTH }}
        >
          <MenuItem value="ALL">All Customers</MenuItem>
          <MenuItem value="PRIMARY">My Primary Customers</MenuItem>
          <MenuItem value="SECONDARY">My Secondary Customers</MenuItem>
        </Select>

      </Box>
      {/* ================= Table ================= */}
      <Paper
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          overflow: "hidden",
        }}
      >

        <TableContainer
          sx={{
            "& .MuiTableCell-root": {
              fontSize: 11,
              paddingTop: 1,
              paddingBottom: 1,
            },
          }}
        >

          <Table
            stickyHeader
            size="small"
            sx={{
              width: "100%",
              tableLayout: "auto",
              "& .MuiTableCell-root": {
                fontSize: 11,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                paddingTop: 1,
                paddingBottom: 1,
              },
            }}
          >
            <TableHead
              sx={{
                "& .MuiTableCell-root": {
                  fontWeight: 600,
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  backgroundColor: "#F9FAFB",
                },
              }}
            >
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 160 }}>
                  Processed Date
                </TableCell>
                <TableCell sx={{ fontWeight: 600, width: 220 }}>
                  Entity
                </TableCell>
                <TableCell sx={{ fontWeight: 600, width: 380 }}>
                  Customer Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, width: 160 }}>
                  Customer PO #
                </TableCell>
                <TableCell sx={{ fontWeight: 600, width: 110 }}>
                  Sales Order #
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    width: 90,
                    textAlign: "left",
                  }}
                >
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, width: 180 }}>
                  Review Data
                </TableCell>
                <TableCell sx={{ fontWeight: 600, width: 90, textAlign: "center" }}>
                  More Details
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRows?.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    "&:hover": {
                      backgroundColor: "#F8FAFF",
                    }
                  }}
                >
                  <TableCell sx={{ fontSize: 12 }}>{row.processing_date}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 12 }}>
                      {row.entity}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 500,
                        whiteSpace: "normal",     // 🔥 allow wrapping
                        wordBreak: "break-word",
                      }}
                    >
                      {row.customer_name}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ fontSize: 12 }}>
                    {row.customer_po_no}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {row.salesorder_no}
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "left",
                      verticalAlign: "middle",
                      fontSize: 12
                    }}
                  >
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: 999,
                        background:
                          row.status === "Approved"
                            ? "linear-gradient(135deg,#34D399,#059669)"
                            : row.status === "Pending Approval"
                              ? "linear-gradient(135deg,#60A5FA,#2563EB)"
                              : "linear-gradient(135deg,#FBBF24,#D97706)",
                        color: "#fff",
                        boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
                      }}
                    />


                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#2F6FED",
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                    onClick={() =>
                      navigate("/ocb", {
                        state: {
                          logId: row.log_id,            // ✅ ADD THIS
                          salesOrderNo: row.salesorder_no,
                          customerName: row.customer_name,
                          fileName: row.file_name,
                          processingDate: row.processing_date,
                          status: row.processing_status,
                        },
                      })
                    }
                  >
                    {row.file_name}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip
                      placement="left"
                      arrow
                      onOpen={() => fetchMoreDetails(row.log_id)}
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "#FFFFFF",
                            color: "#0F172A",
                            borderRadius: 3,
                            px: 2,
                            py: 1.5,
                            boxShadow: "0 10px 30px rgba(15,23,42,0.12)",

                            width: 320,          // ✅ fixed width
                            maxWidth: 320,       // ✅ prevents stretching
                            fontFamily: `"Shorai Sans", sans-serif`,

                            "& .MuiTypography-root": {
                              fontSize: 12,      // ✅ consistent font size
                              lineHeight: 1.5,
                            },
                          },
                        },
                        arrow: {
                          sx: { color: "#FFFFFF" },
                        },
                      }}
                      title={
                        loadingDetail === row.log_id ? (
                          <Typography fontSize={12}>Loading...</Typography>
                        ) : detailCache[row.log_id] ? (
                          <Box>
                            <Typography fontSize={13} fontWeight={700} mb={1}>
                              More Details
                            </Typography>

                            <Box
                              sx={{ height: 1.5, backgroundColor: "#E5E7EB", my: 1 }}
                            />

                            <Box
                              display="grid"
                              gridTemplateColumns="150px 1fr"
                              rowGap={1}
                              columnGap={2}
                            >
                              <Typography fontSize={12} color="text.secondary">
                                Last Reviewed Date
                              </Typography>
                              <Typography fontSize={12} fontWeight={600}>
                                {detailCache[row.log_id].processing_date}
                              </Typography>

                              <Typography fontSize={12} color="text.secondary">
                                Reviewed By
                              </Typography>
                              <Typography fontSize={12}>
                                {detailCache[row.log_id].reviewedBy}
                              </Typography>

                              <Typography fontSize={12} color="text.secondary">
                                Previous Status
                              </Typography>
                              <Chip
                                label={detailCache[row.log_id].previousStatus}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  borderRadius: 999,
                                  background: "linear-gradient(135deg,#34D399,#059669)",
                                  color: "#fff",
                                  width: "fit-content",
                                }}
                              />

                              <Typography fontSize={12} color="text.secondary">
                                Primary CS Group
                              </Typography>
                              <Typography fontSize={12}>
                                {detailCache[row.log_id].pcsinfo}
                              </Typography>

                              <Typography fontSize={12} color="text.secondary">
                                Secondary CS Group
                              </Typography>
                              <Typography fontSize={12}>
                                {detailCache[row.log_id].scsinfo}
                              </Typography>

                              <Typography fontSize={12} color="text.secondary">
                                Approver Comment
                              </Typography>
                              <Typography fontSize={12}>
                                {detailCache[row.log_id].remark}
                              </Typography>
                              <Typography fontSize={12} color="text.secondary">
                                Is Duplicate
                              </Typography>
                              <Typography fontSize={12}>
                                {detailCache[row.log_id].isduplicate}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          "No details available"
                        )
                      }
                    >
                      <IconButton
                        size="small"
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: "#EEF2FF",
                          padding: 0,
                          "&:hover": { backgroundColor: "#E0E7FF" },
                        }}
                      >
                        <VisibilityIcon sx={{ fontSize: 14, color: "#4338CA" }} />
                      </IconButton>

                    </Tooltip>

                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ================= Footer ================= */}
        <Box
          px={3}
          py={1.5}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          borderTop="1px solid #E5E7EB"
        >
          {/* Record count */}
          <Typography fontSize={12} color="text.secondary">
            {filteredRows?.length} record(s)
          </Typography>

          <Box display="flex" gap={1} alignItems="center">
            {/* Post to JDE */}
            {status === "Approved" && (
              <Button
                variant="contained"
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 600,
                  height: 28,
                  px: 2,
                  fontSize: 11,
                  backgroundColor: "#005eb8",
                  "&:hover": { opacity: 0.9 },
                }}
                onClick={handlePostOrders}
                disabled={loading}
              >
                Post to JDE
              </Button>
            )}

            {/* Export CSV button */}
            <Button
              variant="outlined"
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 600,
                height: 28,
                px: 2,
                fontSize: 11,
              }}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </Box>
        </Box>

      </Paper>
    </Box >
  );
};

export default Dashboard;
