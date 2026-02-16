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
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tooltip,
    IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import { DEFAULT_PROMPT } from "../config/prompts/defaultPrompts";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Customer } from "../models/customer.model";
import { useCustomers } from "../hooks/useCustomers";

/* ================= Constants ================= */

const FILE_TYPES = ["CSV", "XLSX", "XML", "JSON"];
const ENTITIES = ["India", "USA", "Japan", "Germany"];

/* ================= Component ================= */

export default function CustomerManagement() {
    const { customers, loading, saveCustomer, toggleStatus, getCustomerById } = useCustomers();

    const emptyForm: Customer = {
        customer_id: "",
        entity: "",
        name: "",
        fileType: "",
        preProcessing: "N",
        piiMasking: "N",
        masterPrompt: DEFAULT_PROMPT,
        customerPrompt: "",
        status: "Active",
        primaryGroup: "",
        secondaryGroup: "",
    };

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Customer | null>(null);
    const [form, setForm] = useState<Customer>(emptyForm);

    const handleSave = async () => {
        await saveCustomer(form, !!editing);
        setOpen(false);
        setEditing(null);
        setForm(emptyForm);
    };

    return (
        <Box>
            <Typography fontSize={22} fontWeight={600} mb={1}>
                Customer Management
            </Typography>

            <Paper sx={{ borderRadius: 4, mt: 2 }}>
                <Box px={3} py={1} display="flex" justifyContent="space-between">
                    <Typography fontWeight={600} />
                    <Button
                        variant="contained"
                        onClick={() => {
                            setEditing(null);
                            setForm(emptyForm);
                            setOpen(true);
                        }}
                    >
                        Add Customer
                    </Button>
                </Box>

                <TableContainer sx={{ overflowX: "auto" }}>
                    <Table sx={{ tableLayout: "auto", width: "100%" }}>
                        <colgroup>
                            <col style={{ minWidth: 100 }} /> {/* Entity */}
                            <col style={{ minWidth: 120 }} /> {/* Customer */}
                            <col style={{ minWidth: 80 }} />  {/* File Type */}
                            <col style={{ minWidth: 50 }} />  {/* Pre */}
                            <col style={{ minWidth: 50 }} />  {/* PII */}
                            <col style={{ minWidth: 150 }} /> {/* Master Prompt */}
                            <col style={{ minWidth: 150 }} /> {/* Customer Prompt */}
                            <col style={{ minWidth: 80 }} />  {/* Status */}
                            <col style={{ minWidth: 100 }} /> {/* Primary Group */}
                            <col style={{ minWidth: 120 }} /> {/* Secondary Group */}
                            <col style={{ minWidth: 100 }} /> {/* Actions */}
                        </colgroup>

                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>Entity</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>File Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>Pre</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>PII</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 15 }} align="center">Master Prompt</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 15 }} align="center">Customer Prompt</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>Primary Group</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>Secondary Group</TableCell>
                                <TableCell
                                    sx={{ fontWeight: 600, fontSize: 15, textAlign: "center", pl: 0 }}
                                >
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {customers.map(c => (
                                <TableRow key={c.customer_id} hover>
                                    <TableCell sx={{ fontSize: 15 }}>{c.entity}</TableCell>
                                    <TableCell sx={{ fontSize: 15 }}>{c.name}</TableCell>
                                    <TableCell sx={{ fontSize: 15 }}>{c.fileType}</TableCell>
                                    <TableCell sx={{ fontSize: 15 }}>{c.preProcessing}</TableCell>
                                    <TableCell sx={{ fontSize: 15 }}>{c.piiMasking}</TableCell>
                                    <TableCell sx={{ fontSize: 15 }} align="center">
                                        <PromptTooltip title="Master Prompt" value={c.masterPrompt} />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: 15 }} align="center">
                                        <PromptTooltip title="Customer Prompt" value={c.customerPrompt} />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: 15 }}>
                                        <Chip
                                            label={c.status}
                                            size="small"
                                            sx={{
                                                fontWeight: 600,
                                                backgroundColor: c.status === "Active" ? "#ECFDF5" : "#FEF2F2",
                                                color: c.status === "Active" ? "#047857" : "#B91C1C",
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: 15 }}>{c.primaryGroup || "-"}</TableCell>
                                    <TableCell sx={{ fontSize: 15 }}>{c.secondaryGroup || "-"}</TableCell>
                                    <TableCell sx={{ fontSize: 15 }} align="center">
                                        <Stack
                                            direction="row"
                                            spacing={1.5}
                                            justifyContent="flex-start"
                                            sx={{ ml: 1 }}   // tweak: 0.5 / 1 / 1.5
                                        >
                                            <Stack
                                                direction="row"
                                                spacing={0.8}
                                                alignItems="center"
                                                sx={actionStyle("#2563EB")}
                                                onClick={async () => {
                                                    const freshCustomer = await getCustomerById(c.customer_id);
                                                    setEditing(freshCustomer);
                                                    setForm(freshCustomer);
                                                    setOpen(true);
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                                <Typography>Edit</Typography>
                                            </Stack>
                                            <Stack
                                                direction="row"
                                                spacing={0.8}
                                                alignItems="center"
                                                sx={actionStyle("#DC2626")}
                                                onClick={() => toggleStatus(c.customer_id)}
                                            >
                                                <BlockIcon fontSize="small" />
                                                <Typography>{c.status === "Active" ? "Deactivate" : "Activate"}</Typography>
                                            </Stack>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

            </Paper>

            {/* ================= Dialog ================= */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
                <DialogTitle>
                    {editing ? "Edit Customer" : "Add Customer"}
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Customer Name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />

                        <FormControl>
                            <InputLabel>Entity</InputLabel>
                            <Select
                                value={form.entity}
                                label="Entity"
                                onChange={e => setForm({ ...form, entity: e.target.value })}
                            >
                                {ENTITIES.map(e => (
                                    <MenuItem key={e} value={e}>{e}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <InputLabel>File Type</InputLabel>
                            <Select
                                value={form.fileType}
                                label="File Type"
                                onChange={e => setForm({ ...form, fileType: e.target.value })}
                            >
                                {FILE_TYPES.map(f => (
                                    <MenuItem key={f} value={f}>{f}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={form.status}
                                label="Status"
                                onChange={e =>
                                    setForm({ ...form, status: e.target.value as any })
                                }
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Deactive">Deactive</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Primary Group"
                            value={form.primaryGroup}
                            onChange={e =>
                                setForm({ ...form, primaryGroup: e.target.value })
                            }
                        />

                        <TextField
                            label="Secondary Group"
                            value={form.secondaryGroup}
                            onChange={e =>
                                setForm({ ...form, secondaryGroup: e.target.value })
                            }
                        />

                        <TextField
                            label="Master Prompt"
                            multiline
                            minRows={6}
                            value={form.masterPrompt}
                            onChange={e =>
                                setForm({ ...form, masterPrompt: e.target.value })
                            }
                        />

                        <TextField
                            label="Customer Prompt"
                            multiline
                            minRows={6}
                            value={form.customerPrompt}
                            onChange={e =>
                                setForm({ ...form, customerPrompt: e.target.value })
                            }
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

/* ================= Helpers ================= */
const PromptTooltip = ({ title, value }: { title: string; value: string }) => (
    <Tooltip
        placement="left"
        arrow
        componentsProps={{
            tooltip: {
                sx: {
                    maxWidth: 520,
                    backgroundColor: "#fff",
                    color: "#0F172A",
                    p: 2,
                    boxShadow: "0 20px 40px rgba(15,23,42,0.18)",
                },
            },
            arrow: { sx: { color: "#fff" } },
        }}
        title={
            <Box>
                <Typography fontWeight={700} mb={1}>
                    {title}
                </Typography>
                <Box
                    sx={{
                        fontFamily: "monospace",
                        fontSize: 13,
                        maxHeight: 220,
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {value || "No prompt configured"}
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
            <VisibilityIcon sx={{ color: "#4338CA", fontSize: 18 }} />
        </IconButton>
    </Tooltip>
);



const actionStyle = (color: string) => ({
    px: 1,
    py: 0.4,
    borderRadius: 1.2,
    cursor: "pointer",
    color,
    backgroundColor: `${color}14`,
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    "&:hover": {
        backgroundColor: `${color}26`,
    },
});
