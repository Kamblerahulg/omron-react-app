import { useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Paper,
  Typography,
  Divider,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FileDropdown from "../components/FileDropdown";
import PdfViewer from "../components/PdfViewer";
import JsonEditor from "../components/JsonEditor";
import ReconciliationTable from "../components/ReconciliationTable";
import Checkbox from "@mui/material/Checkbox";

export default function OMI() {
  const [tab, setTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string>("invoice_123.json");

  const [jsonData, setJsonData] = useState<any>({
    invoiceNumber: "INV-123",
    customer: "OMRON",
    amount: 2500,
    currency: "INR",
  });
  const rows = Array.from({ length: 5 }).map((_, index) => ({
    id: `row-${index}`,
    filename: `invoice_${index + 1}.json`,
    reconciliation: "Matched",
    status: index % 2 === 0 ? "Completed" : "Pending",
  }));

  const fileToPdfMap: Record<string, string> = {
    "invoice_123.json": "/pdfs/invoice_123.pdf",
    "invoice_456.json": "/pdfs/invoice_456.pdf",
  };

  const pdfUrl = fileToPdfMap[selectedFile] || null;
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Box p={3}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          minHeight: 28,
          borderBottom: "1px solid #E6EAF2",

          "& .MuiTabs-indicator": {
            backgroundColor: "#4F8CFF",
            height: "3px",
            borderRadius: "3px",
            transition: "all 0.25s ease",
          },
        }}
      >
        <Tab
          label="Data Verification"
          disableRipple
          sx={{
            minHeight: 48,
            px: 3.5,
            textTransform: "none",

            fontSize: "15.5px",
            fontWeight: 500,
            letterSpacing: "0.2px",

            color: "#667085",

            "&.Mui-selected": {
              color: "#4F8CFF",
              fontWeight: 600,
              letterSpacing: "0.3px",
            },

            "&:hover": {
              color: "#4F8CFF",
              backgroundColor: "transparent",
            },
          }}
        />

        <Tab
          label="Reconciliation"
          disableRipple
          sx={{
            minHeight: 48,
            px: 3.5,
            textTransform: "none",

            fontSize: "15.5px",
            fontWeight: 500,
            letterSpacing: "0.2px",

            color: "#667085",

            "&.Mui-selected": {
              color: "#4F8CFF",
              fontWeight: 600,
              letterSpacing: "0.3px",
            },

            "&:hover": {
              color: "#4F8CFF",
              backgroundColor: "transparent",
            },
          }}
        />
      </Tabs>

      {/* ================= Data Verification ================= */}
      {tab === 0 && (
        <Box mt={3}>
          {/* Select Document */}
          <Paper sx={{ mb: 2 }}>
            <Box px={3} py={2}>
              <Typography fontWeight={600}>Select Document</Typography>
            </Box>
            <Divider />

            <Box px={3} py={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <FileDropdown
                  value={selectedFile}
                  onSelect={setSelectedFile}
                />
                <IconButton>
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>

          {/* PDF + JSON */}
          <Box display="flex" gap={2}>
            {/* PDF Preview */}
            <Paper sx={{ flex: 1 }}>
              <Box
                px={2}
                py={1.5}
                display="flex"
                justifyContent="space-between"
              >
                <Typography fontWeight={600}>PDF Preview</Typography>
                <MoreVertIcon fontSize="small" />
              </Box>

              <Divider />

              <Box px={2} py={1} borderBottom="1px solid #eee">
                <Typography fontSize={13} color="text.secondary">
                  PDF Toolbar
                </Typography>
              </Box>

              <Box p={2} minHeight={420}>
                <PdfViewer pdfUrl={pdfUrl} />
              </Box>
            </Paper>

            {/* JSON Data */}
            <Paper sx={{ flex: 1 }}>
              <Box
                px={2}
                py={1.5}
                display="flex"
                justifyContent="space-between"
              >
                <Typography fontWeight={600}>JSON Data</Typography>

                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  variant="contained"
                  sx={{
                    background: "#E8EDFF",
                    color: "#2F4FD8",
                    boxShadow: "none",
                  }}
                >
                  EDIT
                </Button>
              </Box>

              <Divider />

              <Box p={2} minHeight={420}>
                <JsonEditor data={jsonData} onChange={setJsonData} />
              </Box>
            </Paper>
          </Box>

          {/* Footer */}
          <Paper sx={{ mt: 2 }}>
            <Box
              px={3}
              py={1.5}
              display="flex"
              justifyContent="flex-end"
              gap={2}
            >
              <Button variant="outlined">Cancel</Button>
              <Button variant="contained" sx={{ backgroundColor: "#2F6FED" }}>
                Save Draft
              </Button>
              <Button variant="contained" sx={{ backgroundColor: "#2F6FED" }}>
                Submit For Approval
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* ================= Reconciliation ================= */}
    
    </Box>
  );
}
