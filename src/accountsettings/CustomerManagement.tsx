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
    Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { DEFAULT_PROMPT } from "../config/prompts/defaultPrompts";
import { Customer } from "../models/customer.model";
import { useCustomers } from "../hooks/useCustomers";

/* ================= Constants ================= */

const FILE_TYPES = ["CSV", "XLSX", "XML", "JSON"];
const ENTITIES = ["India", "USA", "Japan", "Germany"];

export default function CustomerManagement() {
    const { customers, saveCustomer, toggleStatus, getCustomerById } =
        useCustomers();

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

    // ONLY showing updated return + styles section
    // Your logic remains the same

    return (
        <Box>
            {/* ===== Header ===== */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                mt={1}

            >
                <Typography
                    fontSize={18}
                    fontWeight={600}
                    fontFamily={`"Shorai Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`}
                >
                    Customer Management
                </Typography>

                <Button
                    variant="contained"
                    size="small"
                    sx={primaryHeaderBtn}
                    onClick={() => {
                        setEditing(null);
                        setForm(emptyForm);
                        setOpen(true);
                    }}
                >
                    + Add Customer
                </Button>
            </Box>

            {/* ===== Table Card ===== */}
            <Paper
                sx={{
                    borderRadius: 3,
                    border: "1px solid #E5E7EB",
                    overflow: "hidden",
                }}
            >
                <TableContainer sx={{ overflowX: "hidden" }}>
                    <Table
                        stickyHeader
                        size="small"
                        sx={{
                            width: "100%",
                            tableLayout: "fixed",
                            "& .MuiTableCell-root": {
                                fontSize: 11,
                                paddingTop: 0.8,
                                paddingBottom: 0.8,
                                whiteSpace: "normal",   // allow wrap
                                overflow: "visible",    // show all text
                                textOverflow: "unset",  // remove ellipsis
                                verticalAlign: "middle",// vertically center content
                            },
                        }}
                    >


                        <colgroup>
                            <col style={{ width: "8%" }} />   {/* Entity */}
                            <col style={{ width: "10%" }} />  {/* Customer - close to Entity */}
                            <col style={{ width: "6%" }} />   {/* File */}
                            <col style={{ width: "6%" }} />   {/* Pre - close to File */}
                            <col style={{ width: "6%" }} />   {/* PII - close to Pre */}
                            <col style={{ width: "7%" }} />   {/* Master */}
                            <col style={{ width: "7%" }} />   {/* Customer Prompt */}
                            <col style={{ width: "8%" }} />   {/* Status */}
                            <col style={{ width: "7%" }} />   {/* Primary */}
                            <col style={{ width: "7%" }} />   {/* Secondary */}
                            <col style={{ width: "18%" }} />  {/* Actions */}
                        </colgroup>

                        <TableHead
                            sx={{
                                "& .MuiTableCell-root": {
                                    fontSize: 11,
                                    paddingTop: 0.8,
                                    paddingBottom: 0.8,
                                    px: 0.8,
                                    fontWeight: 600,
                                    backgroundColor: "#F9FAFB",
                                    whiteSpace: "normal",   // ✅ allow wrap
                                },
                            }}
                        >
                            <TableRow>
                                <TableCell>Entity</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>File</TableCell>
                                <TableCell align="left">Pre Processing</TableCell>
                                <TableCell align="left">PII Masking</TableCell>
                                <TableCell align="left">Master Prompt</TableCell>
                                <TableCell align="left">Customer Prompt</TableCell>
                                <TableCell align="left">Status</TableCell>
                                <TableCell>Primary</TableCell>
                                <TableCell>Secondary</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {customers.map((c) => (
                                <TableRow
                                    key={c.customer_id}
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
                                        {c.entity}
                                    </TableCell>
                                    <TableCell>{c.name}</TableCell>
                                    <TableCell>{c.fileType}</TableCell>
                                    <TableCell align="left">
                                        <Chip
                                            label={c.preProcessing === "Y" ? "Yes" : "No"}
                                            size="small"
                                            sx={booleanChipStyle(c.preProcessing)}
                                        />
                                    </TableCell>

                                    <TableCell align="left">
                                        <Chip
                                            label={c.piiMasking === "Y" ? "Yes" : "No"}
                                            size="small"
                                            sx={booleanChipStyle(c.piiMasking)}
                                        />
                                    </TableCell>
                                    <TableCell align="left">
                                        <PromptTooltip title="Master Prompt" value={c.masterPrompt} />
                                    </TableCell>

                                    <TableCell align="left">
                                        <PromptTooltip
                                            title="Customer Prompt"
                                            value={c.customerPrompt}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={c.status}
                                            size="small"
                                            sx={statusChipStyle(c.status)}
                                        />
                                    </TableCell>

                                    <TableCell>{c.primaryGroup || "-"}</TableCell>
                                    <TableCell>{c.secondaryGroup || "-"}</TableCell>

                                    {/* Actions */}
                                    <TableCell align="left" sx={{ width: 180 }}>
                                        <Box
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                            gap={1}
                                        >
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                                                sx={actionBtn("#2563EB", "#EFF6FF", "#DBEAFE")}
                                                onClick={async () => {
                                                    const fresh = await getCustomerById(
                                                        c.customer_id
                                                    );
                                                    setEditing(fresh);
                                                    setForm(fresh);
                                                    setOpen(true);
                                                }}
                                            >
                                                Edit
                                            </Button>

                                            <Button
                                                size="small"
                                                startIcon={<BlockIcon sx={{ fontSize: 14 }} />}
                                                sx={actionBtn("#DC2626", "#FEF2F2", "#FEE2E2")}
                                                onClick={() => toggleStatus(c.customer_id)}
                                            >
                                                {c.status === "Active"
                                                    ? "Deactivate"
                                                    : "Activate"}
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Footer */}
                <Box
                    px={3}
                    py={1.5}
                    borderTop="1px solid #E5E7EB"
                >
                    <Typography fontSize={12} color="text.secondary">
                        {customers.length} record(s)
                    </Typography>
                </Box>
            </Paper>

            {/* ===== Styled Dialog ===== */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="md"
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
                <DialogTitle sx={dialogTitleStyle}>
                    {editing ? "Edit Customer" : "Add Customer"}
                </DialogTitle>

                <DialogContent sx={{ pt: 2 }}>
                    <Grid container spacing={2}>

                        {/* Customer Name */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                size="small"
                                fullWidth
                                label="Customer Name"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                sx={dialogFieldStyle}
                            />
                        </Grid>

                        {/* Entity */}
                        <Grid item xs={12} md={6}>
                            <FormControl size="small" fullWidth sx={dialogFieldStyle}>
                                <InputLabel>Entity</InputLabel>
                                <Select
                                    value={form.entity}
                                    label="Entity"
                                    onChange={(e) =>
                                        setForm({ ...form, entity: e.target.value })
                                    }
                                >
                                    {ENTITIES.map((e) => (
                                        <MenuItem key={e} value={e}>
                                            {e}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* File Type */}
                        <Grid item xs={12} md={6}>
                            <FormControl size="small" fullWidth sx={dialogFieldStyle}>
                                <InputLabel>File Type</InputLabel>
                                <Select
                                    value={form.fileType}
                                    label="File Type"
                                    onChange={(e) =>
                                        setForm({ ...form, fileType: e.target.value })
                                    }
                                >
                                    {FILE_TYPES.map((f) => (
                                        <MenuItem key={f} value={f}>
                                            {f}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Status */}
                        <Grid item xs={12} md={6}>
                            <FormControl size="small" fullWidth sx={dialogFieldStyle}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={form.status}
                                    label="Status"
                                    onChange={(e) =>
                                        setForm({ ...form, status: e.target.value as any })
                                    }
                                >
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Pre Processing */}
                        <Grid item xs={12} md={6}>
                            <FormControl size="small" fullWidth sx={dialogFieldStyle}>
                                <InputLabel>Pre Processing</InputLabel>
                                <Select
                                    value={form.preProcessing}
                                    label="Pre Processing"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            preProcessing: e.target.value as "Y" | "N",
                                        })
                                    }
                                >
                                    <MenuItem value="Y">Yes</MenuItem>
                                    <MenuItem value="N">No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* PII Masking */}
                        <Grid item xs={12} md={6}>
                            <FormControl size="small" fullWidth sx={dialogFieldStyle}>
                                <InputLabel>PII Masking</InputLabel>
                                <Select
                                    value={form.piiMasking}
                                    label="PII Masking"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            piiMasking: e.target.value as "Y" | "N",
                                        })
                                    }
                                >
                                    <MenuItem value="Y">Yes</MenuItem>
                                    <MenuItem value="N">No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Primary Group */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                size="small"
                                fullWidth
                                label="Primary Group"
                                value={form.primaryGroup}
                                onChange={(e) =>
                                    setForm({ ...form, primaryGroup: e.target.value })
                                }
                                sx={dialogFieldStyle}
                            />
                        </Grid>

                        {/* Secondary Group */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                size="small"
                                fullWidth
                                label="Secondary Group"
                                value={form.secondaryGroup}
                                onChange={(e) =>
                                    setForm({ ...form, secondaryGroup: e.target.value })
                                }
                                sx={dialogFieldStyle}
                            />
                        </Grid>

                        {/* Master Prompt */}
                        <Grid item xs={12}>
                            <TextField
                                size="small"
                                fullWidth
                                multiline
                                minRows={4}
                                label="Master Prompt"
                                value={form.masterPrompt}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        masterPrompt: e.target.value,
                                    })
                                }
                                sx={dialogFieldStyle}
                            />
                        </Grid>

                        {/* Customer Prompt */}
                        <Grid item xs={12}>
                            <TextField
                                size="small"
                                fullWidth
                                multiline
                                minRows={4}
                                label="Customer Prompt"
                                value={form.customerPrompt}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        customerPrompt: e.target.value,
                                    })
                                }
                                sx={dialogFieldStyle}
                            />
                        </Grid>

                    </Grid>
                </DialogContent>

                <DialogActions sx={dialogActionStyle}>
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
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );

}

/* ================= Styles ================= */

const primaryHeaderBtn = {
    borderRadius: 999,
    textTransform: "none",
    fontWeight: 600,
    height: 32,
    px: 3,
    fontSize: 12,
    backgroundColor: "#005EB8",
    boxShadow: "0 4px 12px rgba(0,94,184,0.25)",
    "&:hover": { opacity: 0.9 },
};

const dialogTitleStyle = {
    fontWeight: 600,
    fontSize: 15,
    borderBottom: "1px solid #E5E7EB",
    background: "#FFFFFF",
};

const dialogActionStyle = {
    px: 3,
    py: 2,
    borderTop: "1px solid #E5E7EB",
    background: "#FFFFFF",
};

const dialogFieldStyle = {
    "& .MuiInputLabel-root": { fontSize: 11 },
    "& .MuiOutlinedInput-root": {
        fontSize: 12,
        backgroundColor: "#FFFFFF",
        "& fieldset": { borderColor: "#E5E7EB" },
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
    minWidth: 75,
    borderRadius: 999,
    fontWeight: 600,
    color,
    backgroundColor: bg,
    "&:hover": { backgroundColor: hoverBg },
});
const statusActionBtn = (status: string) => ({
    textTransform: "none",
    fontSize: 11,
    height: 26,
    minWidth: 75,
    borderRadius: 999,
    fontWeight: 600,
    color: status === "Active" ? "#B91C1C" : "#047857",  // red for Active (Deactivate) / green for Inactive (Activate)
    backgroundColor: status === "Active" ? "#FEE2E2" : "#ECFDF5",
    "&:hover": {
        backgroundColor: status === "Active" ? "#FECACA" : "#D1FAE5",
    },
});

const statusChipStyle = (status: string) => ({
    fontWeight: 600,
    fontSize: 10,
    height: 22,
    backgroundColor:
        status === "Active" ? "#ECFDF5" : "#FEF2F2",
    color:
        status === "Active" ? "#047857" : "#B91C1C",
});

const booleanChipStyle = (value: string) => ({
    fontWeight: 600,
    fontSize: 10,
    height: 22,
    backgroundColor:
        value === "Y" ? "#ECFDF5" : "#FEF2F2",
    color:
        value === "Y" ? "#047857" : "#B91C1C",
});

const PromptTooltip = ({
    title,
    value,
}: {
    title: string;
    value: string;
}) => (
    <Tooltip
        placement="left"
        arrow
        disableInteractive
        componentsProps={{
            tooltip: {
                sx: {
                    backgroundColor: "#FFFFFF",
                    color: "#0F172A",
                    borderRadius: 3,
                    px: 2,
                    py: 1.5,
                    boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
                    width: 320,
                    maxWidth: 320,
                    fontFamily: `"Shorai Sans", sans-serif`,
                    "& .MuiTypography-root": {
                        fontSize: 12,
                        lineHeight: 1.5,
                    },
                },
            },
            arrow: {
                sx: { color: "#FFFFFF" },
            },
        }}
        title={
            <Box>
                <Typography fontSize={13} fontWeight={700} mb={1}>
                    {title}
                </Typography>

                <Box sx={{ height: 1.5, backgroundColor: "#E5E7EB", my: 1 }} />

                <Box
                    sx={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        maxHeight: 240,
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
                width: 24,
                height: 24,
                backgroundColor: "#EEF2FF",
                padding: 0,
                borderRadius: 5,
                "&:hover": { backgroundColor: "#E0E7FF" },
            }}
        >
            <VisibilityIcon sx={{ fontSize: 14, color: "#4338CA" }} />
        </IconButton>
    </Tooltip>
);


const EyeIconButton = ({ children }: { children: React.ReactNode }) => (
    <IconButton
        size="small"
        sx={{
            width: 24,
            height: 24,
            backgroundColor: "#EEF2FF",
            padding: 0,
            borderRadius: 5,
            "&:hover": {
                backgroundColor: "#E0E7FF",
            },
        }}
    >
        {children}
    </IconButton>
);

