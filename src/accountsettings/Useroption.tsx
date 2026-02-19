import React, { useState } from "react";
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Button, Stack, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, TableContainer
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import { useEffect } from "react";

import {
  createUser,
  getAllUsers,
  updateUser,
} from "../services/user.service";

type UserState = "Created" | "Active" | "Inactive" | "Suspended";

interface User {
  id: string;
  name: string;
  email: string;
  status: UserState;
  active: boolean;
}


const STATUS: UserState[] = ["Created", "Active", "Inactive", "Suspended"];


export default function UserOption() {
  const [users, setUsers] = useState<User[]>([]);
  const emptyUser: User = {
    id: "",
    name: "",
    email: "",
    status: "Created",
    active: true,
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getAllUsers();

      const formatted = response.items.map((u: any) => ({
        id: u.user_id,
        name: u.username,
        email: u.email,
        status: u.status,
        active: u.status === "Active",
      }));

      setUsers(formatted);
    } catch (error) {
      console.error("Failed to load users", error);
    }
  };


  const saveUser = async () => {
    try {
      if (editing) {
        // UPDATE USER
        await updateUser(editing.id, {
          username: form.name,
          email: form.email,
          status: form.status,
        });
      } else {
        // CREATE USER
        await createUser({
          user_id: Date.now().toString(), // or let backend generate
          username: form.name,
          password: "Temp@123", // 🔁 replace with real input if needed
          email: form.email,
          status: form.status,
        });
      }

      await loadUsers(); // refresh list

      setOpen(false);
      setEditing(null);
      setForm(emptyUser);
    } catch (error) {
      console.error("Save failed", error);
    }
  };
  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus: UserState =
        user.status === "Inactive" ? "Active" : "Inactive";

      await updateUser(user.id, {
        username: user.name,
        email: user.email,
        status: newStatus,
      });

      await loadUsers();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };


  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<User>(emptyUser);


  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        mt={0}
      >
        <Typography
          fontFamily={`"Shorai Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`}
          fontSize={18}
          fontWeight={600}
          mb={1}
        >
          User Options
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
            setForm(emptyUser);
            setOpen(true);
          }}
        >
          + Add User
        </Button>
      </Box>
      {/* ===== Table Card ===== */}
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
        <TableContainer
          sx={{
            flex: 1,
            overflowY: "auto",
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
                <TableCell sx={{ width: 220 }}>Name</TableCell>
                <TableCell sx={{ width: 260 }}>Email</TableCell>
                <TableCell align="center" sx={{ width: 150 }}>
                  Status
                </TableCell>
                <TableCell align="center" sx={{ width: 220 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            {/* ===== BODY ===== */}
            <TableBody>
              {users.map((u) => (
                <TableRow
                  key={u.id}
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
                    {u.name}
                  </TableCell>

                  <TableCell>
                    {u.email}
                  </TableCell>

                  {/* ===== STATUS CHIP (Same Gradient Style) ===== */}
                  <TableCell align="center">
                    <Chip
                      label={u.status}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: 999,
                        background:
                          u.status === "Active"
                            ? "linear-gradient(135deg,#34D399,#059669)"
                            : u.status === "Inactive"
                              ? "linear-gradient(135deg,#F87171,#DC2626)"
                              : u.status === "Suspended"
                                ? "linear-gradient(135deg,#FBBF24,#D97706)"
                                : "linear-gradient(135deg,#60A5FA,#2563EB)",
                        color: "#fff",
                        boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
                      }}
                    />
                  </TableCell>

                  {/* ===== ACTION BUTTONS (Same Pill Style) ===== */}
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Button
                        size="small"
                        startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          textTransform: "none",
                          fontSize: 11,
                          height: 26,
                          minWidth: 80,
                          borderRadius: 999,
                          fontWeight: 600,
                          color: "#2563EB",
                          backgroundColor: "#EFF6FF",
                          "&:hover": { backgroundColor: "#DBEAFE" },
                        }}
                        onClick={() => {
                          setEditing(u);
                          setForm(u);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="small"
                        startIcon={<BlockIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          textTransform: "none",
                          fontSize: 11,
                          height: 26,
                          minWidth: 95,
                          borderRadius: 999,
                          fontWeight: 600,
                          color:
                            u.status === "Inactive"
                              ? "#16A34A"
                              : "#DC2626",
                          backgroundColor:
                            u.status === "Inactive"
                              ? "#ECFDF5"
                              : "#FEF2F2",
                          "&:hover": {
                            backgroundColor:
                              u.status === "Inactive"
                                ? "#D1FAE5"
                                : "#FEE2E2",
                          },
                        }}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.status === "Inactive"
                          ? "Activate"
                          : "Deactivate"}
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
            {users.length} record(s)
          </Typography>
        </Box>
      </Paper>

      {/* Dialog */}
      {/* ===== Styled Dialog (Same as First Component) ===== */}
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
        {/* ===== Header ===== */}
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: 15,
            borderBottom: "1px solid #E5E7EB",
            background: "#FFFFFF",
          }}
        >
          {editing ? "Edit User" : "Add User"}
        </DialogTitle>

        {/* ===== Content ===== */}
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              size="small"
              label="Name"
              fullWidth
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
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

            <FormControl size="small" fullWidth sx={dialogFieldStyle}>
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status}
                label="Status"
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as UserState,
                  })
                }
              >
                {STATUS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        {/* ===== Footer ===== */}
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
            onClick={saveUser}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

    </Box >
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
  "&:hover": {
    backgroundColor: `${color}26`,
  },
});
