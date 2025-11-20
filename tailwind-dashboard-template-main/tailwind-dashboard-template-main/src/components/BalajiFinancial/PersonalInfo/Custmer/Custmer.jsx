import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  Grid,
  IconButton,
  Snackbar,
  Switch,
  TextField,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Typography,
  Alert,
  alpha,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import axios from "axios";

const defaultModel = {
  id: 0,
  firstname: "",
  lastname: "",
  gender: "Male",
  fathername: "",
  address: "",
  mobile: "",
  phone: "",
  category: "",
  reference: "",
  idproof: "",
  disable: false,
  shares: 0,
  loanlimit: 0,
  address2: "",
  mobile2: "",
  phone2: "",
  oldid: "",
  age: "",
  occupation: "",
  spouse: "",
  bussinessexemption: false,
  introname: "",
};

const basePath = "/balaji-finance/PersonalInfo";

const Customer = () => {

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredRows, setFilteredRows] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(15);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState(defaultModel);
  const [errors, setErrors] = useState({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const tempIdMap = new Map();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${basePath}/findAll`);
      const data = Array.isArray(res.data) ? res.data : [];
      setRows(data);
      setFilteredRows(data);
    } catch (err) {
      showSnackbar("Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredRows(rows);
      return;
    }
    const q = search.toLowerCase();
    setFilteredRows(rows.filter(row =>
      Object.values(row).some(val =>
        val?.toString().toLowerCase().includes(q)
      )
    ));
  }, [search, rows]);

  const getStableId = (row) => {
    if (row.id && row.id !== 0) return row.id;
    const key = `${row.firstname}-${row.mobile}-${row.oldid}`;
    if (!tempIdMap.has(key)) {
      tempIdMap.set(key, `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
    }
    return tempIdMap.get(key);
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.firstname.trim()) newErrors.firstname = "First name is required";
    if (!form.mobile.trim()) {
      newErrors.mobile = "Mobile is required";
    } else if (!/^\d{10}$/.test(form.mobile)) {
      newErrors.mobile = "Mobile must be exactly 10 digits";
    }
    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }
    if (form.mobile2 && !/^\d{10}$/.test(form.mobile2)) {
      newErrors.mobile2 = "Alternate mobile must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isEdit) {
        await axios.put(`${basePath}/updatePersonalInfo`, form);
        showSnackbar("Customer updated successfully", "success");
      } else {
        await axios.post(`${basePath}/savePersonalInfo`, form);
        showSnackbar("Customer added successfully", "success");
      }
      setDrawerOpen(false);
      fetchData();
      setForm(defaultModel);
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Operation failed", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${basePath}/deletePersonalInfo/${toDeleteId}`);
      showSnackbar("Customer deleted", "success");
      fetchData();
    } catch (err) {
      showSnackbar("Delete failed", "error");
    } finally {
      setDeleteDialogOpen(false);
      setToDeleteId(null);
    }
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 110,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton size="small" color="primary" onClick={() => {
            setIsEdit(true);
            setForm(params.row);
            setDrawerOpen(true);
          }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => {
            setToDeleteId(getStableId(params.row));
            setDeleteDialogOpen(true);
          }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
    { field: "id", headerName: "ID", width: 80 },
    { field: "firstname", headerName: "First Name", width: 160 },
    { field: "lastname", headerName: "Last Name", width: 160 },
    { field: "gender", headerName: "Gender", width: 100 },
    { field: "mobile", headerName: "Mobile", width: 140 },
    { field: "address", headerName: "Address", width: 300, flex: 1 },
    { field: "category", headerName: "Category", width: 130 },
    { field: "shares", headerName: "Shares", width: 100, type: "number" },
    { field: "loanlimit", headerName: "Loan Limit", width: 130, type: "number" },
    {
      field: "disable",
      headerName: "Status",
      width: 100,
      renderCell: (p) => (
        <Box sx={{ color: p.value ? "error.main" : "success.main", fontWeight: 500 }}>
          {p.value ? "Disabled" : "Active"}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* Clean Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Customer Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Total: {filteredRows.length} customers
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search by name, mobile, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />,
            }}
            sx={{ width: 320, bgcolor: "white", borderRadius: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setIsEdit(false);
              setForm(defaultModel);
              setErrors({});
              setDrawerOpen(true);
            }}
            sx={{ borderRadius: 2, px: 3, py: 1.2 }}
          >
            Add Customer
          </Button>
        </Box>
      </Box>

      {/* Clean DataGrid - No Card, Full Scroll */}
      <Box sx={{ height: 720, width: "100%", bgcolor: "white", borderRadius: 3, overflow: "hidden", boxShadow: 3 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          getRowId={getStableId}
          pageSizeOptions={[10, 15, 25, 50, 100]}
          paginationModel={{ page: 0, pageSize }}
          onPaginationModelChange={(m) => setPageSize(m.pageSize)}
          disableRowSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-row:hover": {
              bgcolor: alpha("#1976d2", 0.08),
              transition: "0.3s",
            },
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "#f0f7ff",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-footerContainer": {
              bgcolor: "#f8f9fa",
              borderTop: "1px solid #e0e0e0",
            },
            "& .MuiDataGrid-virtualScroller": {
              "&::-webkit-scrollbar": { height: 8, width: 8 },
              "&::-webkit-scrollbar-thumb": { bgcolor: "#bbb", borderRadius: 4 },
            },
          }}
        />
      </Box>

      {/* Modern Drawer Form */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: { xs: "100vw", sm: 700 }, p: 5, bgcolor: "#f8fafc" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography variant="h5" fontWeight="bold">
              {isEdit ? "Edit Customer" : "Add New Customer"}
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={form.firstname}
                onChange={(e) => handleChange("firstname", e.target.value)}
                error={!!errors.firstname}
                helperText={errors.firstname}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={form.lastname}
                onChange={(e) => handleChange("lastname", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset">
                <FormLabel>Gender</FormLabel>
                <RadioGroup
                  row
                  value={form.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <FormControlLabel value="Male" control={<Radio />} label="Male" />
                  <FormControlLabel value="Female" control={<Radio />} label="Female" />
                  <FormControlLabel value="Other" control={<Radio />} label="Other" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Father's Name"
                value={form.fathername}
                onChange={(e) => handleChange("fathername", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile *"
                value={form.mobile}
                onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, "").slice(0,10))}
                error={!!errors.mobile}
                helperText={errors.mobile || "10 digits only"}
                inputProps={{ maxLength: 10 }}
                InputProps={{ startAdornment: <PhoneIcon sx={{ color: "text.secondary", mr: 1 }} /> }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Alternate Mobile"
                value={form.mobile2}
                onChange={(e) => handleChange("mobile2", e.target.value.replace(/\D/g, "").slice(0,10))}
                error={!!errors.mobile2}
                helperText={errors.mobile2}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2"
                value={form.address2}
                onChange={(e) => handleChange("address2", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={form.category || ""}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Staff">Staff</MenuItem>
                <MenuItem value="VIP">VIP</MenuItem>
                <MenuItem value="NRI">NRI</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Shares"
                type="number"
                value={form.shares}
                onChange={(e) => handleChange("shares", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Loan Limit"
                type="number"
                value={form.loanlimit}
                onChange={(e) => handleChange("loanlimit", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={form.age}
                onChange={(e) => handleChange("age", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Occupation"
                value={form.occupation}
                onChange={(e) => handleChange("occupation", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.disable}
                    onChange={(e) => handleChange("disable", e.target.checked)}
                  />
                }
                label="Disable Customer"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 5, display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" size="large" onClick={handleSubmit}>
              {isEdit ? "Update Customer" : "Save Customer"}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Customer?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Customer;