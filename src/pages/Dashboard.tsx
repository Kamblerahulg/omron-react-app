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

  const handleOpenAudit = (row: any) => {
    setSelectedAudit(row);
    setAuditOpen(true);
  };
  const modernField = {
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    minWidth: 120,

    "& .MuiOutlinedInput-root": {
      transition: "all 0.3s ease",
      backgroundColor: "#FFFFFF",

      "& fieldset": {
        borderColor: "#E5E7EB",
      },

      "&:hover fieldset": {
        borderColor: "#CBD5E1",
      },

      "&.Mui-focused": {
        transform: "translateY(-1px) scale(1.01)",
        boxShadow: "0 6px 20px rgba(47,111,237,0.15)",

        "& fieldset": {
          borderColor: "#2F6FED",
          borderWidth: 1.5,
        },
      },
    },

    "& .MuiInputLabel-root": {
      fontSize: 13,
      color: "#6B7280",
    },

    "& .MuiInputBase-input": {
      fontSize: 14,
      padding: "10px 12px",
    },
  };

  const fetchMoreDetails = async (logId: string) => {
    if (detailCache[logId]) return; // cache hit

    setLoadingDetail(logId);
    try {
      const data = await processingLogService.getDetailByLogId(logId);

      setDetailCache((prev) => ({
        ...prev,
        [logId]: data,
      }));
    } finally {
      setLoadingDetail(null);
    }
  };

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const data = await processingLogService.list();
        setRows(data);
        setUsingMock(false);
      } catch (error) {
        console.error("API failed, using dummy data", error);
        setRows(MOCK_PROCESSING_LOGS);
        setUsingMock(true);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const getAuditHistoryFromRow = (row: ProcessingLog) => [
    {
      label: "Status",
      value: row.status,
    },
    {
      label: "Processing Status",
      value: row.processing_status,
    },
    {
      label: "Reviewed By",
      value: row.reviewed_by,
    },
    {
      label: "Reviewed At",
      value: new Date(row.reviewed_timestamp).toLocaleString(),
    },
    {
      label: "Entity",
      value: row.entity,
    },
    {
      label: "Processing Date",
      value: row.processing_date,
    },
  ];


  // 🔹 Example data (replace with API/DynamoDB)
  // const rows = [
  //   {
  //     id: 1,
  //     processingDate: "20-01-2026",
  //     entity: "India",
  //     customerName: "Tata Motors",
  //     customerPONo: "CPO-34001",
  //     salesOrderNo: "SO-1001",
  //     fileName: "ACTON_1",
  //     status: "Approved",
  //     reviewer: "Anil R",
  //   },
  //   {
  //     id: 2,
  //     processingDate: "26-01-2026",
  //     entity: "Singapore",
  //     customerName: "Infosys",
  //     customerPONo: "CPO-97001",
  //     salesOrderNo: "SO-1002",
  //     fileName: "ACTON_1",
  //     status: "Pending Approval",
  //     reviewer: "Gabriel C",
  //   },
  //   {
  //     id: 3,
  //     processingDate: "18-01-2026",
  //     entity: "Singapore",
  //     customerName: "Cloud-Kinetics",
  //     customerPONo: "CPO-30077301",
  //     salesOrderNo: "GOR-342",
  //     fileName: "ACTON_1",
  //     status: "JDE-Error",
  //     reviewer: "Alex D",
  //   },
  // ];

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
    return rows.filter((r) => {
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

  const handlePostOrders = async () => {
    try {
      setLoading(true);

      const approvedRows = filteredRows.filter(
        (r) => r.processing_status === "Approved"
      );

      if (!approvedRows.length) return;

      await Promise.all(
        approvedRows.map((row) =>
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

      // Optional: refresh grid
      const data = await processingLogService.list();
      setRows(data);
    } catch (error) {
      console.error("❌ Post to JDE failed", error);
      alert("Failed to post orders to JDE");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box>
      <Typography fontSize={22} fontWeight={600} mb={1}>
        OCB - Sales Order Processing Dashboard
      </Typography>

      {/* ================= Filters ================= */}
      <Box
        display="flex"
        gap={2}
        mb={1}
        sx={{
          // 🔹 layout behavior (same as first box)
          flexWrap: "nowrap",           // ❌ no wrapping
          overflowX: "auto",            // ✅ horizontal scroll
          whiteSpace: "nowrap",
          alignItems: "center",

          // 🔹 existing styles (unchanged)
          p: 2,
          borderRadius: 3,
          background: "rgba(255,255,255,0.75)",
          border: "1px solid rgba(226,232,240,0.8)",
          boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 16,
          zIndex: 10,

          // 🔹 scrollbar styling (added)
          "&::-webkit-scrollbar": {
            height: 6,
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#CBD5E1",
            borderRadius: 4,
          },
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
          sx={modernField}
        />

        {/* End Date */}
        <TextField
          type="date"
          size="small"
          label="End Date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={modernField}
        />
        {/* Entity */}
        <Select
          size="small"
          value={entity}
          displayEmpty
          onChange={(e) => setEntity(e.target.value)}
          sx={{ ...modernField, minWidth: 140 }}
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
                ...modernField,
                minWidth: 160,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",       // same as Select
                  '& fieldset': {
                    borderColor: "#ccc",     // normal border color
                    borderWidth: 1,
                  },
                  '&:hover fieldset': {
                    borderColor: "#999",     // hover border
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: "#2F6FED",  // focus border
                    borderWidth: 2,
                  },
                  height: 43,                 // same as Select
                },
                "& .MuiOutlinedInput-input": {
                  padding: "8px 12px",        // adjust to match Select text vertical alignment
                  fontSize: 14,
                  boxSizing: "border-box",
                  height: "24px",              // inner input height to align vertically
                },
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
          sx={{ ...modernField, minWidth: 160 }}
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
          sx={{ ...modernField, minWidth: 140 }}
        />
        {/* Sales Order No */}
        <TextField
          size="small"
          label="Sales Order #"
          value={salesOrderNo}
          onChange={(e) => setSalesOrderNo(e.target.value)}
          sx={{ ...modernField, minWidth: 140 }}
        />

        {/* Customer Type */}
        <Select
          size="small"
          value={customerType}
          onChange={(e) => setCustomerType(e.target.value)}
          sx={{ ...modernField, minWidth: 140 }}
        >
          <MenuItem value="ALL">All Customers</MenuItem>
          <MenuItem value="PRIMARY">My Primary Customers</MenuItem>
          <MenuItem value="SECONDARY">My Secondary Customers</MenuItem>
        </Select>

      </Box>


      {/* ================= Table ================= */}
      <Paper
        sx={{
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          overflow: "hidden",

        }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: 15, width: 160 }}>
                  Processed Date
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15, width: 220 }}>
                  Entity
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15, width: 220 }}>
                  Customer Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15, width: 200 }}>
                  Customer PO #
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15, width: 180 }}>
                  Sales Order #
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 15,
                    width: 120,
                    textAlign: "left",
                  }}
                >
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15, width: 260 }}>
                  Review Data
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15, width: 130, textAlign: "center" }}>
                  More Details
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    "&:hover": {
                      backgroundColor: "#F9FAFB",
                    },
                  }}
                >
                  <TableCell sx={{ fontSize: 15 }}>{row.processing_date}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 15 }}>
                      {row.entity}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                      {row.customer_name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: 15 }}>
                    {row.customer_po_no}
                  </TableCell>
                  <TableCell sx={{ fontSize: 15 }}>
                    {row.salesorder_no}
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "left",
                      verticalAlign: "middle",
                    }}
                  >
                    <Chip
                      label={row.processing_status}
                      size="small"
                      sx={{
                        minWidth: 120,
                        fontSize: 14,
                        fontWeight: 600,
                        borderRadius: 2,
                        backgroundColor:
                          row.processing_status === "Approved"
                            ? "#ECFDF5"
                            : row.processing_status === "Pending Approval"
                              ? "#EFF6FF"
                              : "#FFFBEB",
                        color:
                          row.processing_status === "Approved"
                            ? "#047857"
                            : row.processing_status === "Pending Approval"
                              ? "#1D4ED8"
                              : "#B45309",
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: 15,
                      fontWeight: 500,
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
                            borderRadius: 2,
                            p: 2.5,
                            boxShadow: "0 20px 40px rgba(15,23,42,0.18)",
                            maxWidth: 480,
                            minWidth: 360,
                          },
                        },
                        arrow: { sx: { color: "#FFFFFF" } },
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
                                {detailCache[row.log_id].lastReviewedDate}
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
                            </Box>
                          </Box>
                        ) : (
                          "No details available"
                        )
                      }
                    >
                      <IconButton
                        sx={{
                          backgroundColor: "#EEF2FF",
                          "&:hover": {
                            backgroundColor: "#E0E7FF",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <VisibilityIcon sx={{ color: "#4338CA" }} />
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
          py={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          borderTop="1px solid #E5E7EB"
        >
          <Typography fontSize={13} color="text.secondary">
            {filteredRows.length} record(s)
          </Typography>

          {status === "Approved" && (
            <Button
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                background: "linear-gradient(135deg, #2F6FED, #2F6FED)",
              }}
              onClick={handlePostOrders}
              disabled={loading}
            >
              Post to JDE
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
