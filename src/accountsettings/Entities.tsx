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
interface Entity {
  id: string;
  entity: string;
  masterPrompt: string;
  status: string;
}

export default function Entities() {
  const [entities, setEntities] = useState<Entity[]>([
    {
      id: "1",
      entity: "Invoice",
      masterPrompt: "Generate invoice summary",
      status: "Active",
    },
  ]);

  const emptyForm: Entity = {
    id: "",
    entity: "",
    masterPrompt: "",
    status: "",
  };

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Entity | null>(null);
  const [form, setForm] = useState<Entity>(emptyForm);

  const saveEntity = () => {
    if (editing) {
      setEntities(prev =>
        prev.map(e => (e.id === editing.id ? form : e))
      );
    } else {
      setEntities(prev => [
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
      <Typography fontSize={22} fontWeight={600} mb={1}>
        Entity Management
      </Typography>

      <Paper sx={{ borderRadius: 4, mt: 2 }}>
        <Box px={3} py={1} display="flex" justifyContent="space-between">
          <Typography />
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add Entity
          </Button>
        </Box>

        <TableContainer sx={{ overflowX: "hidden" }}>
          <Table sx={{ tableLayout: "fixed", width: "100%" }}>
            <colgroup>
              <col style={{ width: "25%" }} />
              <col style={{ width: "35%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>

            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>
                  Entity
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>
                  Master Prompt
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>
                  Status
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, fontSize: 15 }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {entities.map(row => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontSize: 15 }}>
                    {row.entity}
                  </TableCell>

                  <TableCell sx={{ fontSize: 14 }}>
                    {row.masterPrompt}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor:
                          row.status === "Active" ? "#ECFDF5" : "#FEF2F2",
                        color:
                          row.status === "Active" ? "#047857" : "#B91C1C",
                      }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={1.5}
                      justifyContent="center"
                      alignItems="center"
                    >
                      {/* Edit */}
                      <Stack
                        direction="row"
                        spacing={0.8}
                        alignItems="center"
                        sx={actionStyle("#2563EB")}
                        onClick={() => {
                          setEditing(row);
                          setForm(row);
                          setOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                        <Typography fontSize={15}>Edit</Typography>
                      </Stack>

                      {/* Deactivate */}
                      <Stack
                        direction="row"
                        spacing={0.8}
                        alignItems="center"
                        sx={actionStyle("#DC2626")}
                      >
                        <BlockIcon fontSize="small" />
                        <Typography fontSize={15}>Deactivate</Typography>
                      </Stack>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ===== Dialog ===== */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {editing ? "Edit Entity" : "Add Entity"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Entity Name"
              value={form.entity}
              onChange={e =>
                setForm({ ...form, entity: e.target.value })
              }
            />

            <TextField
              label="Master Prompt"
              multiline
              minRows={3}
              value={form.masterPrompt}
              onChange={e =>
                setForm({ ...form, masterPrompt: e.target.value })
              }
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status}
                label="Status"
                onChange={e =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Deactive">Deactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEntity}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

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
  "&:hover": {
    backgroundColor: `${color}26`,
  },
});
