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
  Autocomplete,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";

type RoleType = "SysAdmin" | "Reviewer" | "Approver" | "Viewer";
type GroupType = "SG_CS" | "VN_CS" | "ID_CS";
type EntityType = "Finance" | "HR" | "IT" | "Operations";

const ROLES: RoleType[] = ["SysAdmin", "Reviewer", "Approver", "Viewer"];
const GROUPS: GroupType[] = ["SG_CS", "VN_CS", "ID_CS"];
const ENTITIES: EntityType[] = ["Finance", "HR", "IT", "Operations"];

interface UserMapping {
  id: string;
  user: string;
  email: string;
  roles: RoleType[];
  groups: GroupType[];
  entity: EntityType | "";
}

export default function UserMapping() {
  const [data, setData] = useState<UserMapping[]>([
    {
      id: "1",
      user: "Rahul Kamble",
      email: "rahul@company.com",
      roles: ["SysAdmin"],
      groups: ["VN_CS", "ID_CS"],
      entity: "Finance", // Added default entity
    },
  ]);

  const emptyForm: UserMapping = {
    id: "",
    user: "",
    email: "",
    roles: [],
    groups: [],
    entity: "",
  };

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserMapping | null>(null);
  const [form, setForm] = useState<UserMapping>(emptyForm);

  const saveMapping = () => {
    if (editing) {
      setData(prev =>
        prev.map(d => (d.id === editing.id ? form : d))
      );
    } else {
      setData(prev => [
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
      {/* ===== Top Header Row ===== */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        mt={1}
      >
        <Typography
          fontFamily={`"Shorai Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`}
          fontSize={18}
          fontWeight={600}
        >
          User-Role-Group Mapping
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
          + Add Mapping
        </Button>
      </Box>

      {/* ===== Styled Table Card ===== */}
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
                <TableCell sx={{ width: 160 }}>User</TableCell>
                <TableCell sx={{ width: 220 }}>Email</TableCell>
                <TableCell sx={{ width: 180 }}>Roles</TableCell>
                <TableCell sx={{ width: 180 }}>Groups</TableCell>
                <TableCell sx={{ width: 140 }}>Entity</TableCell>
                <TableCell align="center" sx={{ width: 220 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            {/* ===== BODY ===== */}
            <TableBody>
              {data.map((row) => (
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
                    {row.user}
                  </TableCell>

                  <TableCell>{row.email}</TableCell>

                  <TableCell>{row.roles.join(", ")}</TableCell>

                  <TableCell>{row.groups.join(", ")}</TableCell>

                  <TableCell>{row.entity}</TableCell>

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
            {data.length} record(s)
          </Typography>
        </Box>
      </Paper>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: "linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)",
            boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: 15,
            borderBottom: "1px solid #E5E7EB",
            background: "#FFFFFF",
          }}
        >
          {editing ? "Edit User Mapping" : "Add User Mapping"}
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              size="small"
              label="User Name"
              fullWidth
              value={form.user}
              onChange={(e) =>
                setForm({ ...form, user: e.target.value })
              }
              sx={dialogFieldStyle}
            />

            <TextField
              size="small"
              label="Email"
              fullWidth
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              sx={dialogFieldStyle}
            />

            {/* Roles */}
            <Autocomplete
              multiple
              options={ROLES}
              value={form.roles}
              onChange={(_, value) =>
                setForm({ ...form, roles: value })
              }
              renderInput={(params) => (
                <TextField {...params} label="Roles" size="small" sx={dialogFieldStyle} />
              )}
            />

            {/* Groups */}
            <Autocomplete
              multiple
              options={GROUPS}
              value={form.groups}
              onChange={(_, value) =>
                setForm({ ...form, groups: value })
              }
              renderInput={(params) => (
                <TextField {...params} label="Groups" size="small" sx={dialogFieldStyle} />
              )}
            />

            {/* Entity */}
            <Autocomplete
              options={ENTITIES}
              value={form.entity}
              onChange={(_, value) =>
                setForm({ ...form, entity: value || "" })
              }
              renderInput={(params) => (
                <TextField {...params} label="Entity" size="small" sx={dialogFieldStyle} />
              )}
            />
          </Stack>
        </DialogContent>

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
            onClick={saveMapping}
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

/* ===== Reusable Action Style ===== */
const actionStyle = (color: string) => ({
  px: 1,
  py: 0.4,
  borderRadius: 1.2,
  cursor: "pointer",
  color,
  fontSize: 14,
  backgroundColor: `${color}14`,
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  "& svg": { fontSize: 18 },
  "&:hover": { backgroundColor: `${color}26` },
});
