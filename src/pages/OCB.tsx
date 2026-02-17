import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DescriptionIcon from "@mui/icons-material/Description";
import DataObjectIcon from "@mui/icons-material/DataObject";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useLocation, useNavigate } from "react-router-dom";
import PdfViewer from "../components/PdfViewer";
import JsonEditor from "../components/JsonEditor";
import { getPdfUrl, getJsonData, rejectFile } from "../api/omiApi";
import React from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Tooltip from "@mui/material/Tooltip";
import { processingLogService }
  from "../services/processingLog.service";

import { ProcessingLog }
  from "../models/processingLog.model";
import { MOCK_PROCESSING_LOGS } from "../mocks/processingLog.mock";
export default function OCB() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const [originalJson, setOriginalJson] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [pdfCollapsed, setPdfCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailsAnchor, setDetailsAnchor] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const handleOpenDetails = (
    event: React.MouseEvent<HTMLElement>,
    row: any
  ) => {
    setDetailsAnchor(event.currentTarget);
    setSelectedRow(row);
  };

  const handleCloseDetails = () => {
    setDetailsAnchor(null);
    setSelectedRow(null);
  };

  const isDetailsOpen = Boolean(detailsAnchor);

  const getRowSpan = (items: any[], index: number, key: string) => {
    if (index > 0 && items[index][key] === items[index - 1][key]) {
      return 0; // skip rendering
    }

    let span = 1;
    for (let i = index + 1; i < items.length; i++) {
      if (items[i][key] === items[index][key]) {
        span++;
      } else {
        break;
      }
    }

    return span;
  };

  const location = useLocation();

  const {
    fileName,
    customerName,
    processingDate,
    status: routeStatus,
    logId,
    salesOrderNo,
  } = location.state || {};
  const isCustomerMissing =
    !customerName || customerName.trim().length === 0;

  const [status, setStatus] = useState<
    | "Pending Approval"
    | "Approved"
    | "JDE-Success"
    | "JDE-Error"
    | "Rejected"
  >(routeStatus || "Pending Approval");
  const [pdfType, setPdfType] = useState<"original" | "marked">("original");
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveRemark, setApproveRemark] = useState("");

  const isReadOnly = status === "Approved" || status === "JDE-Success";
  const navigate = useNavigate();
  const [jdeDialogOpen, setJdeDialogOpen] = React.useState(false);
  const [rows, setRows] = useState<ProcessingLog[]>([]);
  const handleEdit = () => {
    setOriginalJson(JSON.parse(JSON.stringify(jsonData))); // deep copy
    setIsEditing(true);
  };

  const handleRevert = () => {
    setJsonData(originalJson);
    setIsEditing(false);
    setOriginalJson(null);
  };

  const jdeErrorDescription = `
Sales Order could not be processed due to invalid customer
mapping in JDE. Please verify customer, country mapping,
pricing setup, and retry after correction.
`;

  /* ---------------- Effects ---------------- */
  useEffect(() => {
    if (isCustomerMissing) {
      navigate("/"); // 👈 dashboard route
    }
  }, [isCustomerMissing, navigate]);
  const handleSave = () => {
    // 🔥 API call can go here if needed
    // await saveJson(jsonData)

    setIsEditing(false);
    setOriginalJson(null);
  };

  useEffect(() => {
    if (fileName) setSelectedFile(fileName);
  }, [fileName]);

  useEffect(() => {
    if (!selectedFile) return;

    const url =
      pdfType === "original"
        ? getPdfUrl(selectedFile)
        : getPdfUrl(`masked/${selectedFile}`); // adjust if API differs

    setPdfUrl(url.startsWith("/") ? url : `/${url}`);
  }, [selectedFile, pdfType]);


  useEffect(() => {
    if (jsonData && !originalJson) {
      setOriginalJson(jsonData);
    }
  }, [jsonData]);
  useEffect(() => {
    if (!selectedFile) return;

    const fetchJson = async () => {
      try {
        const data = await getJsonData(selectedFile);
        setJsonData(data);
      } catch (err) {
        console.error("Failed to load JSON", err);
      }
    };

    fetchJson();
  }, [selectedFile]);
  const handleBackToTable = () => {
    setJsonData(originalJson); // discard edits
    setIsEditing(false);       // go back to table view
    setOriginalJson(null);
  };

  /* ---------------- UI ---------------- */
  const processedDate = new Date().toLocaleDateString();

  const adaptedJson = React.useMemo(() => {
    if (!jsonData) return null;

    // const items = (jsonData.items || []).map((item: any) => ({
    //   customerPartNo: item["Customer Part No"],
    //   requestedDate: item["Requested Date"],
    //   qtyOrder: Number(item["Quantity"] || 0),
    //   unitPrice: Number(item["Unit Price"] || 0),
    //   salesUnitPriceBasis: item["Sales Unit Price Basis"] || "-",
    //   poshipwaydestination: item["PO Shipway_Destination"] || "-",
    //   cpnFlag: item["CPN Flag"] || "-",
    //   unitpriceflag: item["Unit Price Flag"] || "-",
    //   jdeitemno: item["JDE Item No"] || "-",
    //   jdeunitprice: item["JDE Unit Price"] || "-",
    //   coremark: item["CO Remark"] || "-",
    //   poremark: item["PO Remark"] || "-",
    //   spnumber: item["SP Number"] || "-",
    // }));

    return {
      company: jsonData["Company"],
      soldTo: jsonData["Sold To"],
      shipTo: jsonData["Ship To"],
      currency: jsonData["Currency"],
      customerPo: jsonData["Customer PO"],
      processedDate,
      overallConfidence:
        jsonData.confidence_scores?.overall_confidence ?? "-",
      // items,
    };
  }, [jsonData]);



  const handleReject = async () => {
    try {
      setLoading(true);

      await processingLogService.updateProcessingStatus(logId, {
        processing_status: "Reject",
        salesorder_number: salesOrderNo,
        requested_date: new Date().toISOString(),
      });

      setStatus("Rejected");
      setRejectOpen(false);
      setRejectReason("");
      navigate("/");
    } catch (error) {
      console.error("Reject failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);

      await processingLogService.updateProcessingStatus(logId, {
        processing_status: "Approved",
        salesorder_number: salesOrderNo,
        requested_date: new Date().toISOString(),
      });

      setStatus("Approved");
      setApproveOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Approve failed", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box>
      {/* ===== FILTER / HEADER BAR ===== */}
      <Paper
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 3,
          background:
            "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
        >
          <Stack direction="row" spacing={2.5} alignItems="center">
            {/* 🔹 Vertical Divider */}

            <Box>
              <Typography fontSize={12} color="text.secondary">
                Overall Confidence Score
              </Typography>
              <Typography fontWeight={500} fontSize={"15px"}>
                {adaptedJson?.overallConfidence}
              </Typography>

            </Box>
            <Box
              sx={{
                width: "1px",
                height: 36,
                backgroundColor: "rgba(0,0,0,0.08)", // very faint
              }}
            />

            <Box>
              <Typography fontSize={12} color="text.secondary">
                Approver Comment
              </Typography>
              <Typography fontWeight={500} fontSize={"15px"}>
                {"Verified"}
              </Typography>

            </Box>
            {/* 🔹 Vertical Divider */}
            <Box
              sx={{
                width: "1px",
                height: 36,
                backgroundColor: "rgba(0,0,0,0.08)",
              }}
            />

            <Box>
              <Typography fontSize={12} color="text.secondary">
                Is Deplicate
              </Typography>
              <Typography fontWeight={500} fontSize={"15px"}>
                {"N"}
              </Typography>

            </Box>
            {/* 🔹 Vertical Divider */}
            <Box
              sx={{
                width: "1px",
                height: 36,
                backgroundColor: "rgba(0,0,0,0.08)",
              }}
            />

            <Chip
              label={status}
              color={
                status === "Approved"
                  ? "success"
                  : status === "Rejected"
                    ? "error"
                    : "warning"
              }
              sx={{
                fontWeight: 600,
                px: 1,
              }}
            />
          </Stack>
        </Stack>
      </Paper>
      {/* ===== PDF + JSON SECTION ===== */}
      <Box
        display="flex"
        gap={2}
        width="100%"
        height="calc(100vh - 240px)"
        alignItems="stretch"
      >
        {/* -------- PDF Preview -------- */}
        <Paper
          sx={{
            width: pdfCollapsed ? "64px" : "50%",
            minWidth: pdfCollapsed ? "64px" : "50%",
            transition: "all 0.35s ease",
            overflow: "hidden",
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* HEADER */}
          <Box
            px={1.5}
            py={1}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            {/* LEFT SIDE */}
            {!pdfCollapsed && (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <DescriptionIcon fontSize="small" />
                <Typography fontWeight={600} fontSize={14}>
                  Sales Order PDF
                </Typography>

                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={pdfType}
                  onChange={(_, value) => value && setPdfType(value)}
                  sx={{
                    height: 28,
                    "& .MuiToggleButton-root": {
                      px: 1.2,
                      fontSize: 12,
                      fontWeight: 600,
                    },
                  }}
                >
                  <ToggleButton value="original">Original</ToggleButton>
                  <ToggleButton value="masked">Masked</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            )}

            {/* RIGHT SIDE – Collapse */}
            <IconButton
              onClick={() => setPdfCollapsed(!pdfCollapsed)}
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                backgroundColor: "rgb(0, 94, 184)",
                color: "#F1F5FF",
                transition: "all 0.35s ease",
                "&:hover": {
                  backgroundColor: "#E0E7FF",
                  transform: "rotate(180deg)",
                },
              }}
            >
              {pdfCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Box>

          <Divider />

          {/* PDF VIEW */}
          {!pdfCollapsed && (
            <Box p={1.5} flex={1} minHeight={420}>
              <PdfViewer pdfUrl={pdfUrl} />
            </Box>
          )}
        </Paper>

        {/* -------- JSON Data -------- */}
        <Paper
          sx={{
            width: pdfCollapsed ? "calc(100% - 64px)" : "50%",
            transition: "all 0.35s ease",
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            px={2}
            py={1.5}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* LEFT – Title + Editing indicator */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography fontWeight={500} fontSize={"15px"}>Extracted Data</Typography>

              {isEditing && (
                <Chip
                  label="Editing"
                  color="warning"
                  size="small"
                  sx={{ ml: 0.5, fontWeight: 600 }}
                />
              )}
            </Stack>

            {/* RIGHT – Edit / Save / Revert buttons */}
            <Stack direction="row" spacing={1.2}>
              {!isEditing ? (
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  variant="contained"
                  disabled={isReadOnly || isCustomerMissing}
                  onClick={handleEdit}
                  sx={{
                    background: isReadOnly ? "#E5E7EB" : "#EEF2FF",
                    color: isReadOnly ? "#9CA3AF" : "#4338CA",
                    boxShadow: "none",
                    fontWeight: 600,
                  }}
                >
                  Edit Json
                </Button>
              ) : (
                <>
                  {/* 🔙 BACK TO TABLE */}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleBackToTable}
                    sx={{ fontWeight: 600 }}
                  >
                    Back
                  </Button>

                  {/* 💾 SAVE */}
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={handleSave}
                    sx={{ fontWeight: 600 }}
                  >
                    Save
                  </Button>

                  {/* ♻️ REVERT */}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleRevert}
                    sx={{ fontWeight: 600 }}
                  >
                    Revert
                  </Button>
                </>
              )}

            </Stack>
          </Box>
          <Divider />

          <Box
            px={2}
            bgcolor="#F9FAFB"
            borderBottom="1px solid #E5E7EB"
          >
          </Box>

          <Box
            p={0}
            flex={1}
            overflow="auto"
          >

            {/* ===== VIEW MODE (Summary + Table) ===== */}
            {!isEditing && Array.isArray(jsonData) && jsonData.length > 0 && (
              <Box>

                {/* ================= STATIC HEADER (ONLY ONCE) ================= */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    position: "sticky",
                    top: 0,
                    zIndex: 5,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <Box
                    display="grid"
                    gridTemplateColumns="180px 1fr"
                    rowGap={1}
                    columnGap={3}
                  >
                    <Typography color="text.secondary">
                      Customer Name
                    </Typography>
                    <Typography fontWeight={600}>
                      {jsonData[0]["Company"] || "-"}
                    </Typography>

                    <Typography color="text.secondary">
                      Sold To
                    </Typography>
                    <Typography fontWeight={600}>
                      {jsonData[0]["Sold To"] || "-"}
                    </Typography>

                    <Typography color="text.secondary">
                      Ship To
                    </Typography>
                    <Typography fontWeight={600}>
                      {jsonData[0]["Ship To"] || "-"}
                    </Typography>
                  </Box>
                </Paper>

                {/* ================= DOCUMENT LOOP (ONLY DYNAMIC PARTS) ================= */}
                {jsonData.map((doc: any, docIndex: number) => {
                  const itemKeys = [
                    { label: "CPN", key: "Customer Part No" },
                    { label: "Qty Order", key: "Quantity" },
                    { label: "Unit Price", key: "Unit Price" },
                    { label: "Request Date", key: "Requested Date" },
                    { label: "Overwrite Request Date", key: "Overwrite Requested Date" },
                    { label: "PO Shipway Destination", key: "PO Shipway_Destination" },
                    { label: "More Details", key: "CO Remark" },
                  ];

                  return (
                    <Box key={docIndex} mb={2}>

                      {/* ================= DYNAMIC HEADER ================= */}
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          position: "sticky",
                          top: 120, // adjust depending on static header height
                          zIndex: 4,
                          backgroundColor: "#FFFFFF",
                        }}
                      >
                        <Box
                          display="grid"
                          gridTemplateColumns="180px 1fr"
                          rowGap={1}
                          columnGap={3}
                        >
                          <Typography color="text.secondary">
                            Currency
                          </Typography>
                          <Typography fontWeight={500}>
                            {doc["Currency"] || "-"}
                          </Typography>

                          <Typography color="text.secondary">
                            Customer PO
                          </Typography>
                          <Typography fontWeight={500}>
                            {doc["Customer PO"] || "-"}
                          </Typography>
                        </Box>
                      </Paper>

                      {/* ================= ITEMS TABLE ================= */}
                      <Paper
                        variant="outlined"
                        sx={{ borderRadius: 2, overflow: "hidden" }}
                      >
                        <Box sx={{ width: "100%", overflowX: "auto" }}>
                          <Box
                            component="table"
                            width="100%"
                            sx={{
                              borderCollapse: "collapse",
                              minWidth: 900,
                              "& th": {
                                backgroundColor: "#F9FAFB",
                                fontWeight: 600,
                                borderBottom: "1px solid #E5E7EB",
                                whiteSpace: "nowrap",
                              },
                              "& td": {
                                borderBottom: "1px solid #F1F5F9",
                                whiteSpace: "nowrap",
                              },
                            }}
                          >
                            {/* HEADER */}
                            <Box component="thead">
                              <Box component="tr">
                                {itemKeys.map((col) => (
                                  <Box
                                    key={col.key}
                                    component="th"
                                    sx={{ px: 2, py: 1, textAlign: "left" }}
                                  >
                                    {col.label}
                                  </Box>
                                ))}
                              </Box>
                            </Box>

                            {/* BODY */}
                            <Box component="tbody">
                              {doc.items?.map((row: any, rowIndex: number) => (
                                <Box component="tr" key={rowIndex}>
                                  {itemKeys.map((col) => {
                                    const value = row[col.key];

                                    const isCpnInvalid =
                                      col.key === "Customer Part No" &&
                                      row["CPN Flag"] === "N";

                                    const isUnitPriceInvalid =
                                      col.key === "Unit Price" &&
                                      row["Unit Price Flag"] === "N";

                                    return (
                                      <Box
                                        key={col.key}
                                        component="td"
                                        sx={{
                                          px: 2,
                                          py: 1,
                                          color:
                                            isCpnInvalid || isUnitPriceInvalid
                                              ? "#DC2626"
                                              : "#111827",
                                          fontWeight:
                                            isCpnInvalid || isUnitPriceInvalid
                                              ? 600
                                              : 400,
                                        }}
                                      >
                                        {col.key === "CO Remark" ? (
                                          <Tooltip
                                            placement="left"
                                            arrow
                                            componentsProps={{
                                              tooltip: {
                                                sx: {
                                                  backgroundColor: "#FFFFFF",
                                                  color: "#0F172A",
                                                  borderRadius: 2,
                                                  p: 2.5,
                                                  boxShadow: "0 20px 40px rgba(15,23,42,0.18)",
                                                  maxWidth: 420,
                                                  minWidth: 320,
                                                },
                                              },
                                              arrow: { sx: { color: "#FFFFFF" } },
                                            }}
                                            title={
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
                                                    JDE Item No
                                                  </Typography>
                                                  <Typography fontSize={12} fontWeight={600}>
                                                    {row["JDE Item No"] || "-"}
                                                  </Typography>

                                                  <Typography fontSize={12} color="text.secondary">
                                                    JDE Unit Price
                                                  </Typography>
                                                  <Typography fontSize={12}>
                                                    {row["JDE Unit Price"] || "-"}
                                                  </Typography>

                                                  <Typography fontSize={12} color="text.secondary">
                                                    CO Remark
                                                  </Typography>
                                                  <Typography fontSize={12}>
                                                    {row["CO Remark"] || "-"}
                                                  </Typography>

                                                  <Typography fontSize={12} color="text.secondary">
                                                    PO Remark
                                                  </Typography>
                                                  <Typography fontSize={12}>
                                                    {row["PO Remark"] || "-"}
                                                  </Typography>

                                                  <Typography fontSize={12} color="text.secondary">
                                                    SP Number
                                                  </Typography>
                                                  <Typography fontSize={12}>
                                                    {row["SP Number"] || "-"}
                                                  </Typography>
                                                </Box>
                                              </Box>
                                            }
                                          >
                                            <IconButton
                                              size="small"
                                              sx={{
                                                backgroundColor: "#EEF2FF",
                                                "&:hover": {
                                                  backgroundColor: "#E0E7FF",
                                                  transform: "scale(1.1)",
                                                },
                                              }}
                                            >
                                              <VisibilityIcon
                                                fontSize="small"
                                                sx={{ color: "#4338CA" }}
                                              />
                                            </IconButton>
                                          </Tooltip>
                                        ) : (

                                          String(value ?? "-")
                                        )}
                                      </Box>
                                    );
                                  })}
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* ===== EDIT MODE (Raw JSON) ===== */}
            {isEditing && jsonData && (
              <JsonEditor
                data={jsonData}
                readOnly={false}
                onChange={setJsonData}
              />
            )}
          </Box>
        </Paper>
      </Box>

      {/* ===== FOOTER ACTIONS ===== */}
      <Paper sx={{ mt: 2, borderRadius: 3 }}>
        <Box
          px={3}
          py={1.5}
          display="flex"
          alignItems="center"
        >
          {/* LEFT SIDE – JDE Error Description */}
          <Box flex={1}>
            {status === "JDE-Error" && (
              <Typography
                fontSize={13}
                fontWeight={600}
                color="error"
                sx={{
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => setJdeDialogOpen(true)}
              >
                JDE Error Description
              </Typography>
            )}
          </Box>

          {/* RIGHT SIDE – ACTION BUTTONS (ALWAYS RIGHT) */}
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => navigate("/")}>
              Back
            </Button>

            <Button
              variant="contained"
              color="error"
              sx={{ fontWeight: 600 }}
              disabled={status === "Rejected" || status === "Approved" || isCustomerMissing}
              onClick={() => setRejectOpen(true)}
            >
              Reject
            </Button>

            <Button
              variant="contained"
              disabled={status === "Approved" || isCustomerMissing || loading}
              sx={{
                backgroundColor:
                  status === "Pending Approval"
                    ? "rgb(0, 94, 184)"
                    : "#E5E7EB",
                color:
                  status === "Pending Approval"
                    ? "#fff"
                    : "#9CA3AF",
                fontWeight: 600,
                boxShadow: "none",
              }}
              onClick={handleApprove}
            >
              Approve
            </Button>
          </Stack>
        </Box>

        <Dialog
          open={approveOpen}
          onClose={() => setApproveOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle fontWeight={600}>Approve File</DialogTitle>

          <DialogContent>
            <Typography fontSize={13} color="text.secondary" mb={1}>
              Confirm approval for this file
            </Typography>

            {/* Optional remark */}
            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="Enter approval remark (optional)"
              value={approveRemark}
              onChange={(e) => setApproveRemark(e.target.value)}
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>

            {/* Normal Approve */}
            <Button
              variant="contained"
              onClick={() => {
                setStatus("Approved");
                setApproveOpen(false);
                // 👉 API: normal approve
                // approveFile({ skip: false, remark: approveRemark })
              }}
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>


        {/* Reject Dialog (unchanged) */}
        <Dialog
          open={rejectOpen}
          onClose={() => setRejectOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle fontWeight={600}>Reject File</DialogTitle>

          <DialogContent>
            <Typography fontSize={13} color="text.secondary" mb={1}>
              Please provide a reason for rejection
            </Typography>

            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="Enter rejection reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setRejectOpen(false)}>Cancel</Button>

            <Button
              variant="contained"
              color="error"
              disabled={!rejectReason.trim()}
              onClick={handleReject}
            >
              Submit Reject
            </Button>
          </DialogActions>
        </Dialog>

        {/* JDE ERROR DESCRIPTION POPUP */}
        <Dialog
          open={jdeDialogOpen}
          onClose={() => setJdeDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle fontWeight={600} color="error">
            JDE Error Description
          </DialogTitle>

          <DialogContent>
            <Typography fontSize={14} sx={{ whiteSpace: "pre-line" }}>
              {jdeErrorDescription}
            </Typography>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setJdeDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
      <Dialog
        open={isDetailsOpen}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={600}>
          Item Additional Details
        </DialogTitle>

        <DialogContent dividers>
          <Box display="grid" rowGap={1}>
            <Typography>
              <strong>JDE Item No:</strong>{" "}
              {selectedRow?.["JDE Item No"] || "-"}
            </Typography>

            <Typography>
              <strong>JDE Unit Price:</strong>{" "}
              {selectedRow?.["JDE Unit Price"] || "-"}
            </Typography>

            <Typography>
              <strong>CO Remark:</strong>{" "}
              {selectedRow?.["CO Remark"] || "-"}
            </Typography>

            <Typography>
              <strong>PO Remark:</strong>{" "}
              {selectedRow?.["PO Remark"] || "-"}
            </Typography>

            <Typography>
              <strong>SP Number:</strong>{" "}
              {selectedRow?.["SP Number"] || "-"}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
