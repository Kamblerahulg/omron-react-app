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
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
        // const data = await getJsonData(selectedFile);
        const data = await processingLogService.getDetailByLogId(logId)
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
          mb: 0.5,
          mt: 0.5,
          px: 1.5, // slightly smaller padding like second example
          py: 1.5,
          borderRadius: 2,
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr) auto", // 3 fields + chip
            alignItems: "center",
            gap: 1.5, // compact gap
          }}
        >
          {[
            { label: "Overall Confidence Score", value: adaptedJson?.overallConfidence || "-" },
            { label: "Approver Comment", value: "Verified" },
            { label: "Is Duplicate", value: "N" },
          ].map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                pr: index < 2 ? 2 : 0, // spacing before vertical divider
                borderRight: index < 2 ? "1px solid #E5E7EB" : "none",
              }}
            >
              <Typography
                fontSize={9} // smaller label font
                color="text.secondary"
                noWrap
                sx={{ mb: 0.25 }}
              >
                {item.label}
              </Typography>

              <Typography
                fontWeight={600}
                fontSize={11} // smaller value font
                noWrap
              >
                {item.value}
              </Typography>
            </Box>
          ))}

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Chip
              label={status}
              size="small"
              color={
                status === "Approved" || status === "JDE-Success"
                  ? "success"
                  : status === "Rejected"
                    ? "error"
                    : "warning"
              }
              sx={{ fontWeight: 600, fontSize: 10, height: 22 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* ===== PDF + JSON SECTION ===== */}
      <Box
        display="flex"
        gap={2}
        width="100%"
        height="calc(115vh - 240px)"
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
            py={0.6}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            {/* LEFT SIDE */}
            {!pdfCollapsed && (
              <Stack direction="row" spacing={1} alignItems="center">
                <DescriptionIcon sx={{ fontSize: 18 }} />

                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: 0.2,
                  }}
                >
                  Invoice / Delivery Order PDF
                </Typography>

                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={pdfType}
                  onChange={(_, value) => value && setPdfType(value)}
                  sx={{
                    height: 26,
                    "& .MuiToggleButton-root": {
                      px: 1,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "none",
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
                width: 30,
                height: 30,
                borderRadius: 1.5,
                backgroundColor: "rgba(0, 94, 184)",
                color: "#F1F5FF",
                "&:hover": {
                  backgroundColor: "#1E40AF",
                },
              }}
            >
              {pdfCollapsed ? (
                <ChevronRightIcon sx={{ fontSize: 18 }} />
              ) : (
                <ChevronLeftIcon sx={{ fontSize: 18 }} />
              )}
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
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: 40,
              px: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* LEFT – Title + Editing indicator */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: 0.2,
                }}
              >
                Extracted Data
              </Typography>
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
                    fontSize: 12,
                    fontWeight: 500,
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
                    mb: 0.5,
                    mt: 0.5,
                    px: 1.5,         // slightly smaller padding
                    py: 1,
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
                    <Typography fontSize={12} color="text.secondary">
                      Customer Name
                    </Typography>
                    <Typography fontWeight={500} fontSize="12px">
                      {jsonData[0]["Company"] || "-"}
                    </Typography>

                    <Typography fontSize={12} color="text.secondary">
                      Sold To
                    </Typography>
                    <Typography fontWeight={500} fontSize="12px">
                      {jsonData[0]["Sold To"] || "-"}
                    </Typography>

                    <Typography fontSize={12} color="text.secondary">
                      Ship To
                    </Typography>
                    <Typography fontWeight={500} fontSize="12px">
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
                          mt: 0.1,
                          borderRadius: 2,
                          position: "sticky",
                          top: 90, // adjust depending on static header height
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
                          <Typography fontSize={12} color="text.secondary">
                            Currency
                          </Typography>
                          <Typography fontWeight={500} fontSize="12px">
                            {doc["Currency"] || "-"}
                          </Typography>

                          <Typography fontSize={12} color="text.secondary">
                            Customer PO
                          </Typography>
                          <Typography fontWeight={500} fontSize="12px">
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
                                fontSize: "11px", // ↓ smaller font
                              },
                              "& td": {
                                borderBottom: "1px solid #F1F5F9",
                                whiteSpace: "nowrap",
                                fontSize: "10px", // ↓ smaller font for row data
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
      <Paper
        sx={{
          mt: 2,
          borderRadius: 3,
          bgcolor: "#f3f4f6", // same background as OMI
          px: 2.5,
          py: 1.5,
        }}
      >
        <Box display="flex" alignItems="center">
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

          {/* RIGHT SIDE – ACTION BUTTONS */}
          <Box display="flex" gap={1} alignItems="center">
            {/* Back Button */}
            <Button
              variant="outlined"
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 600,
                height: 28,
                px: 2,
                fontSize: 11,
                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                "&:active": { opacity: 0.9 },
              }}
              onClick={() => navigate("/")}
            >
              Back
            </Button>

            {/* Reject Button */}
            <Button
              variant="contained"
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 600,
                height: 28,
                px: 2,
                fontSize: 11,
                backgroundColor: "#d14343",
                "&:hover": { backgroundColor: "#d14343", opacity: 0.9 },
                "&:active": { backgroundColor: "#d14343", opacity: 0.95 },
              }}
              disabled={status === "Rejected" || status === "Approved" || isCustomerMissing}
              onClick={() => setRejectOpen(true)}
            >
              Reject
            </Button>

            {/* Approve Button */}
            <Button
              variant="contained"
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 600,
                height: 28,
                px: 2,
                fontSize: 11,
                backgroundColor:
                  status === "Pending Approval" ? "#005eb8" : "#E5E7EB",
                color: status === "Pending Approval" ? "#fff" : "#9CA3AF",
                "&:hover": {
                  backgroundColor: status === "Pending Approval" ? "#005eb8" : "#E5E7EB",
                  opacity: status === "Pending Approval" ? 0.9 : 1,
                },
                "&:active": {
                  backgroundColor: status === "Pending Approval" ? "#005eb8" : "#E5E7EB",
                  opacity: status === "Pending Approval" ? 0.95 : 1,
                },
              }}
              disabled={status === "Approved" || isCustomerMissing || loading}
              onClick={handleApprove}
            >
              Approve
            </Button>
          </Box>
        </Box>

        {/* ...Dialogs remain unchanged */}
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

    </Box >
  );
}
