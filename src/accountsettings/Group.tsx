import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TableContainer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";

/* ===== Types ===== */
interface Group {
  id: string;
  group: string;
  status: string;
}

export default function GroupPage() {
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "1",
      group: "SG_CS",
      status: "Active",
    },
  ]);

  const emptyForm: Group = {
    id: "",
    group: "",
    status: "",
  };

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [form, setForm] = useState<Group>(emptyForm);

  const saveGroup = () => {
    if (editing) {
      setGroups(prev =>
        prev.map(g => (g.id === editing.id ? form : g))
      );
    } else {
      setGroups(prev => [
        ...prev,
        { ...form, id: Date.now().toString() },
      ]);
    }
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  return (
    <Box>
      {/* ===== Header Row ===== */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          fontSize={18}
          fontWeight={600}
          fontFamily={`"Shorai Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`}
        >
          Group Management
        </Typography>

        <Button
          variant="contained"
          size="small"
          sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 600,
            height: 32,
            px: 3,
            fontSize: 12,
            backgroundColor: "#005EB8",
            boxShadow: "0 4px 12px rgba(0,94,184,0.25)",
            "&:hover": { opacity: 0.9 },
          }}
          onClick={() => {
            setEditing(null);
            setForm(emptyForm);
            setOpen(true);
          }}
        >
          + Add Group
        </Button>
      </Box>

      {/* ===== Table Card ===== */}

      {/* ===== Styled Table Card (Aligned with Mapping Page) ===== */}
      <Paper
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          overflow: "hidden",
          mt: 2,
        }}
      >
        <TableContainer sx={{ flex: 1, overflowY: "auto" }}>
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
            {/* ===== HEADER ===== */}
            <TableHead
              sx={{
                "& .MuiTableCell-root": {
                  fontWeight: 600,
                  fontSize: 12,
                  backgroundColor: "#F9FAFB",
                },
              }}
            >
              <TableRow>
                <TableCell sx={{ width: 220 }}>Group</TableCell>
                <TableCell sx={{ width: 180 }}>Status</TableCell>
                <TableCell align="center" sx={{ width: 220 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            {/* ===== BODY ===== */}
            <TableBody>
              {groups.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    transition: "all 0.25s ease",
                    "&:hover": {
                      backgroundColor: "#F8FAFF",
                      boxShadow:
                        "inset 0 0 0 1px #E0E7FF, 0 4px 12px rgba(99,102,241,0.08)",
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>
                    {row.group}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: 10,
                        height: 22,
                        backgroundColor:
                          row.status === "Active"
                            ? "#ECFDF5"
                            : "#FEF2F2",
                        color:
                          row.status === "Active"
                            ? "#047857"
                            : "#B91C1C",
                      }}
                    />
                  </TableCell>

                  {/* ===== ACTIONS ===== */}
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Button
                        size="small"
                        startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                        sx={actionBtn("#2563EB", "#EFF6FF", "#DBEAFE")}
                        onClick={() => {
                          setEditing(row);
                          setForm(row);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="small"
                        startIcon={<BlockIcon sx={{ fontSize: 14 }} />}
                        sx={actionBtn("#DC2626", "#FEF2F2", "#FEE2E2")}
                      >
                        Deactivate
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ===== FOOTER ===== */}
        <Box
          px={3}
          py={1.5}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          borderTop="1px solid #E5E7EB"
        >
          <Typography fontSize={12} color="text.secondary">
            {groups.length} record(s)
          </Typography>
        </Box>
      </Paper>

      {/* ===== Dialog ===== */}
      {/* ===== Styled Dialog ===== */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background:
              "linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)",
            boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: 15,
            borderBottom: "1px solid #E5E7EB",
            background: "#FFFFFF",
          }}
        >
          {editing ? "Edit Group" : "Add Group"}
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              size="small"
              label="Group Name"
              fullWidth
              value={form.group}
              onChange={(e) =>
                setForm({ ...form, group: e.target.value })
              }
              sx={dialogFieldStyle}
            />

            <FormControl size="small" fullWidth sx={dialogFieldStyle}>
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status}
                label="Status"
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Deactive">Deactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        {/* Footer */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #E5E7EB",
            background: "#FFFFFF",
          }}
        >
          <Button
            variant="outlined"
            size="small"
            sx={dialogCancelBtn}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            size="small"
            sx={dialogPrimaryBtn}
            onClick={saveGroup}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

const dialogFieldStyle = {
  "& .MuiInputLabel-root": {
    fontSize: 11,
  },
  "& .MuiOutlinedInput-root": {
    fontSize: 12,
    height: 34,
    backgroundColor: "#FFFFFF",
    "& fieldset": {
      borderColor: "#E5E7EB",
    },
  },
  "& .MuiOutlinedInput-input": {
    padding: "6px 10px",
  },
};

const dialogPrimaryBtn = {
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 600,
  fontSize: 11,
  height: 28,
  px: 2,
  backgroundColor: "#005EB8",
  "&:hover": { opacity: 0.9 },
};

const dialogCancelBtn = {
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 600,
  fontSize: 11,
  height: 28,
  px: 2,
};

const actionBtn = (
  color: string,
  bg: string,
  hoverBg: string
) => ({
  textTransform: "none",
  fontSize: 11,
  height: 26,
  minWidth: 90,
  borderRadius: 999,
  fontWeight: 600,
  color,
  backgroundColor: bg,
  "&:hover": { backgroundColor: hoverBg },
});

