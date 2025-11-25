import React, { useEffect, useState, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { successToast, errorToast } from "toastify";
import { API_BASE } from "lib/config";
import {
  Drawer,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Autocomplete,
  CircularProgress,
  IconButton,
  Paper,
  Chip,
} from "@mui/material";
import {
  Save,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";

const LOAN_TYPE = { DAILY_FINANCE: "DAILY_FINANCE" };
const FIXED_DURATION_DAYS = 100;

const DailyFinance = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentLoanId, setCurrentLoanId] = useState(null);

  const [formData, setFormData] = useState({
    customerId: null,
    guarantor1: null,
    guarantor2: null,
    guarantor3: null,
    partnerId: "",
    startDate: dayjs(),
    endDate: dayjs().add(FIXED_DURATION_DAYS, "day"),
    amount: "",
    interest: "",
    installment: "",
    processingFee: "",
    security: "",
  });

  const [options, setOptions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  };

  // FETCH ALL LOANS + ENRICH WITH NAMES
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/BusinessMember/findAll`, {
        headers,
      });
      const loans = Array.isArray(res.data) ? res.data : [];

      const memberIds = new Set();
      loans.forEach((loan) => {
        loan.customerId && memberIds.add(loan.customerId);
        [loan.guarantor1, loan.guarantor2, loan.guarantor3].forEach(
          (g) => g && memberIds.add(g)
        );
      });

      const memberMap = {};
      if (memberIds.size > 0) {
        try {
          const mRes = await axios.get(`${API_BASE}/PersonalInfo/byIds`, {
            headers,
            params: { ids: Array.from(memberIds).join(",") },
          });
          mRes.data.forEach((m) => {
            memberMap[m.id] =
              `${m.firstname || ""} ${m.lastname || ""}`.trim() ||
              `ID: ${m.id}`;
          });
        } catch (e) {
          console.warn("Failed to fetch member names", e);
        }
      }

      const getName = (id) => (!id ? "-" : memberMap[id] || ` ${id}`);

      const enriched = loans.map((loan) => ({
        id: loan.id || "N/A",
        customerName: getName(loan.customerId),
        amount: loan.amount || 0,
        interest: loan.interest || 0,
        installment: loan.installment || 0,
        startDate: loan.startDate
          ? dayjs(loan.startDate).format("DD-MM-YYYY")
          : "-",
        endDate: loan.endDate ? dayjs(loan.endDate).format("DD-MM-YYYY") : "-",
        g1Name: getName(loan.guarantor1),
        g2Name: getName(loan.guarantor2),
        g3Name: getName(loan.guarantor3),
        partnerId: loan.partnerId || "-",
      }));

      setRows(enriched);
    } catch (err) {
      errorToast("Failed to load loans");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto update maturity date
  useEffect(() => {
    if (formData.startDate) {
      setFormData((prev) => ({
        ...prev,
        endDate: prev.startDate.add(FIXED_DURATION_DAYS, "day"),
      }));
    }
  }, [formData.startDate]);

  // Auto calculate daily installment
  useEffect(() => {
    if (!formData.amount || !formData.interest) {
      setFormData((prev) => ({ ...prev, installment: "" }));
      return;
    }
    const principal = Number(formData.amount);
    const rate = Number(formData.interest) / 100 / 365;
    const totalAmount = principal + principal * rate * FIXED_DURATION_DAYS;
    const dailyInstallment = Math.round(totalAmount / FIXED_DURATION_DAYS);
    setFormData((prev) => ({
      ...prev,
      installment: dailyInstallment.toString(),
    }));
  }, [formData.amount, formData.interest]);

  const searchMembers = useCallback(
    async (query) => {
      if (!query || query.trim().length < 2) {
        setOptions([]);
        return;
      }
      setLoadingSearch(true);
      try {
        const res = await axios.get(`${API_BASE}/PersonalInfo/autocomplete`, {
          headers,
          params: { q: query.trim() },
        });
        const list = (res.data || []).map((item) => ({
          id: item.id,
          label: `${item.firstname || ""} ${item.lastname || ""} - ${
            item.mobile || "No Mobile"
          } (${item.id})`.trim(),
        }));
        setOptions(list);
      } catch (err) {
        errorToast("Search failed");
        setOptions([]);
      } finally {
        setLoadingSearch(false);
      }
    },
    [headers]
  );

  const resetForm = () => {
    setFormData({
      customerId: null,
      guarantor1: null,
      guarantor2: null,
      guarantor3: null,
      partnerId: "",
      startDate: dayjs(),
      endDate: dayjs().add(FIXED_DURATION_DAYS, "day"),
      amount: "",
      interest: "",
      installment: "",
      processingFee: "",
      security: "",
    });
    setIsEditMode(false);
    setCurrentLoanId(null);
  };

  const handleEdit = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/BusinessMember/findById/${id}`, {
        headers,
      });
      const l = res.data;

      setFormData({
        customerId: { id: l.customerId, label: "" },
        guarantor1: l.guarantor1 ? { id: l.guarantor1, label: "" } : null,
        guarantor2: l.guarantor2 ? { id: l.guarantor2, label: "" } : null,
        guarantor3: l.guarantor3 ? { id: l.guarantor3, label: "" } : null,
        partnerId: l.partnerId || "",
        startDate: dayjs(l.startDate),
        endDate: dayjs(l.endDate),
        amount: l.amount.toString(),
        interest: l.interest.toString(),
        installment: l.installment?.toString() || "",
        processingFee: l.processingFee?.toString() || "",
        security: l.security || "",
      });
      setCurrentLoanId(id);
      setIsEditMode(true);
      setOpen(true);
      successToast("Loan loaded for editing");
    } catch (err) {
      errorToast("Failed to load loan");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this loan permanently?")) return;
    try {
      await axios.delete(`${API_BASE}/BusinessMember/delete/${id}`, {
        headers,
      });
      successToast("Loan deleted successfully!");
      fetchData();
    } catch (err) {
      errorToast("Delete failed");
    }
  };

  const handleSave = async () => {
    if (!formData.customerId?.id) return errorToast("Customer is required");

    const payload = {
      customerId: formData.customerId.id,
      guarantor1: formData.guarantor1?.id || "",
      guarantor2: formData.guarantor2?.id || "",
      guarantor3: formData.guarantor3?.id || "",
      partnerId: formData.partnerId,
      startDate: formData.startDate.format("YYYY-MM-DD HH:mm:ss"),
      endDate: formData.endDate.format("YYYY-MM-DD HH:mm:ss"),
      amount: Number(formData.amount),
      interest: Number(formData.interest),
      processingFee: Number(formData.processingFee) || 0,
      security: formData.security,
      duration: FIXED_DURATION_DAYS,
    };

    try {
      if (isEditMode) {
        await axios.put(
          `${API_BASE}/BusinessMember/update/${currentLoanId}`,
          payload,
          { headers }
        );
        successToast("Loan updated successfully!");
      } else {
        await axios.post(
          `${API_BASE}/BusinessMember/update/${LOAN_TYPE.DAILY_FINANCE}`,
          payload,
          { headers }
        );
        successToast("New loan created successfully!");
      }
      setOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      errorToast(err.response?.data?.message || "Save failed");
    }
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row.id)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
    { field: "id", headerName: "Acc No", width: 100 },
    { field: "customerName", headerName: "Customer Name", width: 260 },
    {
      field: "amount",
      headerName: "Loan Amount",
      width: 140,
      renderCell: (params) =>
        `₹${Number(params.value).toLocaleString("en-IN")}`,
    },
    { field: "interest", headerName: "Interest %", width: 100 },
    {
      field: "installment",
      headerName: "Daily Installment",
      width: 160,
      renderCell: (params) =>
        params.value ? `₹${Number(params.value).toLocaleString("en-IN")}` : "-",
    },
    { field: "startDate", headerName: "Loan Date", width: 130 },
    { field: "endDate", headerName: "Maturity Date", width: 140 },
    { field: "g1Name", headerName: "Guarantor 1", width: 220 },
    { field: "g2Name", headerName: "Guarantor 2", width: 220 },
    { field: "g3Name", headerName: "Guarantor 3", width: 220 },
    { field: "partnerId", headerName: "Partner/Agent", width: 150 },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
    
          }}
        >
          <Typography variant="h5" fontWeight={700} color="#1e293b">
            Daily Finance Loans
          </Typography>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            New Loan
          </Button>
        </Box>

  
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(r) => r.id}
            pageSizeOptions={[10, 25, 50, 100]}
            autoHeight
            sx={{ "& .MuiDataGrid-cell": { fontSize: "0.95rem" } }}
          />

      </Box>

      {/* DRAWER FORM */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
      >
        <Box
          sx={{
            width: { xs: "100vw", sm: 480 },
            p: 4,
            bgcolor: "background.paper",
            height: "100%",
            overflowY: "auto",
          }}
        >
          <Typography variant="h5" fontWeight={800} gutterBottom>
            {isEditMode ? "Edit Daily Finance Loan" : "New Daily Finance Loan"}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            {isEditMode
              ? `Acc No: ${currentLoanId}`
              : "100 Days Fixed • Daily Collection"}
          </Typography>

          {/* Customer & Dates */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={options}
                sx={{width:"230px"}}
                loading={loadingSearch}
                value={formData.customerId}
                onChange={(e, v) =>
                  setFormData((p) => ({ ...p, customerId: v }))
                }
                onInputChange={(e, v) => v && searchMembers(v)}
                getOptionLabel={(o) => o?.label || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Customer Name *"
                    variant="filled"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Loan Date *"
                value={formData.startDate}
                onChange={(v) => setFormData((p) => ({ ...p, startDate: v }))}
                slotProps={{
                  textField: { variant: "filled", fullWidth: true },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Maturity Date"
                value={formData.endDate}
                readOnly
                slotProps={{
                  textField: { variant: "filled", fullWidth: true },
                }}
              />
            </Grid>
          </Grid>

          <Chip
            label="LOAN DETAILS"
            color="success"
            sx={{ mb: 2, fontWeight: 600 }}
          />
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="filled"
                label="Loan Amount *"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, amount: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="filled"
                label="Interest %"
                type="number"
                value={formData.interest}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, interest: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="filled"
                label="Daily Installment"
                value={
                  formData.installment
                    ? `₹${Number(formData.installment).toLocaleString("en-IN")}`
                    : ""
                }
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="filled"
                label="Duration"
                value="100 Days Fixed"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="filled"
                label="Processing Fee"
                type="number"
                value={formData.processingFee}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, processingFee: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="filled"
                label="Security / Remarks"
                value={formData.security}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, security: e.target.value }))
                }
              />
            </Grid>
          </Grid>

          <Chip
            label="GUARANTORS"
            sx={{ bgcolor: "#8b5cf6", color: "white", mb: 2, fontWeight: 600 }}
          />
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {["guarantor1", "guarantor2", "guarantor3"].map((field, i) => (
              <Grid item xs={12} sm={i === 0 ? 12 : 6} key={field}>
                <Autocomplete
                sx={{width:"240px"}}
                  options={options}
                  value={formData[field]}
                  onChange={(e, v) =>
                    setFormData((p) => ({ ...p, [field]: v }))
                  }
                  getOptionLabel={(o) => o?.label || ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={`Guarantor ${i + 1}${
                        i === 0 ? " (Required)" : ""
                      }`}
                      variant="filled"
                    />
                  )}
                />
              </Grid>
            ))}
          </Grid>

          <TextField
            fullWidth
            variant="filled"
            label="Partner / Agent"
            value={formData.partnerId}
            onChange={(e) =>
              setFormData((p) => ({ ...p, partnerId: e.target.value }))
            }
            sx={{ mb: 4 }}
          />

          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="contained" color="success" onClick={handleSave}>
              {isEditMode ? "Update Loan" : "Create Loan"}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </LocalizationProvider>
  );
};

export default DailyFinance;
