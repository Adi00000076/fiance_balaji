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
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState(defaultModel);
  const [errors, setErrors] = useState({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const tempIdMap = new Map();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${basePath}/findAll`);
      const data = Array.isArray(res.data) ? res.data : [];
      setRows(data);
      setFilteredRows(data);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to load data",
        severity: "error",
      });
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
    setFilteredRows(
      rows.filter((row) =>
        Object.values(row).some((val) =>
          val?.toString().toLowerCase().includes(q)
        )
      )
    );
  }, [search, rows]);

  const getStableId = (row) => {
    if (row.id && row.id !== 0) return row.id;
    const key = `${row.firstname}-${row.mobile}-${row.oldid}`;
    if (!tempIdMap.has(key)) {
      tempIdMap.set(
        key,
        `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      );
    }
    return tempIdMap.get(key);
  };

  const showSnackbar = (msg, type = "info") => {
    setSnackbar({ open: true, message: msg, severity: type });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.firstname.trim()) newErrors.firstname = "First name required";
    if (!form.mobile.trim()) {
      newErrors.mobile = "Mobile required";
    } else if (!/^\d{10}$/.test(form.mobile)) {
      newErrors.mobile = "Exactly 10 digits";
    }
    if (form.phone && !/^\d{10}$/.test(form.phone))
      newErrors.phone = "10 digits only";
    if (form.mobile2 && !/^\d{10}$/.test(form.mobile2))
      newErrors.mobile2 = "10 digits only";
    if (form.phone2 && !/^\d{10}$/.test(form.phone2))
      newErrors.phone2 = "10 digits only";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    if (["mobile", "phone", "mobile2", "phone2"].includes(field)) {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    if (["shares", "loanlimit", "age"].includes(field)) {
      value = value === "" ? 0 : Number(value);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isEdit) {
        await axios.put(`${basePath}/updatePersonalInfo`, form);
        showSnackbar("Customer updated successfully", "success");
      } else {
        await axios.post(`${basePath}/savePersonalInfo`, form);
        showSnackbar("Customer created successfully", "success");
      }
      setDrawerOpen(false);
      fetchData();
      setForm(defaultModel);
      setErrors({});
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Save failed", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${basePath}/deletePersonalInfo/${toDeleteId}`);
      showSnackbar("Deleted successfully", "success");
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
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              setIsEdit(true);
              setForm(params.row);
              setErrors({});
              setDrawerOpen(true);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setToDeleteId(getStableId(params.row));
              setDeleteDialogOpen(true);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
    { field: "id", headerName: "ID", width: 80 },
    { field: "firstname", headerName: "First Name", width: 160 },
    // { field: "lastname", headerName: "Last Name", width: 160 },
    // { field: "gender", headerName: "Gender", width: 100 },
    { field: "mobile", headerName: "Mobile", width: 140 },
    { field: "address", headerName: "Address", width: 300, flex: 1 },
    // { field: "category", headerName: "Category", width: 130 },
    { field: "shares", headerName: "Shares", width: 110 },
    { field: "loanlimit", headerName: "Loan Limit", width: 130 },
    {
      field: "disable",
      headerName: "Status",
      width: 160,
      renderCell: (p) => (
        <Box
          sx={{
          

          }}
        >
                <Button
            variant="outlined"
            size="small"
            sx={{
              fontWeight: 600,
              color: p.value ? "error.main" : "success.main",
            }}
          >
            {p.value ? "Disabled" : "Active"}
  

        
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 1, bgcolor: "white", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* LEFT - Heading */}
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Customer
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Total Records: {filteredRows.length}
          </Typography>
        </Box>

        {/* CENTER - Search */}
        <Box
          sx={{ flexGrow: 1, display: "flex", justifyContent: "center", px: 3 }}
        >
          <TextField
            size="small"
            placeholder="Search by name, mobile, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: "400px" }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          />
        </Box>

        {/* RIGHT - Add Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setIsEdit(false);
            setForm(defaultModel);
            setErrors({});
            setDrawerOpen(true);
          }}
        >
          Add
        </Button>
      </Box>

      {/* Data Table */}
      <Box
        sx={{
          height: 400,
          width: "100%",
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          getRowId={getStableId}
          pageSizeOptions={[10, 25, 50, 100]}
          paginationModel={{ page: 0, pageSize: 15 }}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Full Form Drawer */}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{
            width: { xs: "100vw", sm: 600 },
            p: { xs: 3, md: 5 },
            bgcolor: "#f8fafc",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="primary">
              {isEdit ? "Edit Customer" : "Add New Customer"}
            </Typography>
            <IconButton
              onClick={() => setDrawerOpen(false)}
              size="large"
              sx={{
                bgcolor: "grey.100",
                "&:hover": { bgcolor: "grey.200" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form - Strictly 2 Columns per Row */}
          <Grid container spacing={3}>
            {/* Row 1 */}
            <Grid item xs={12} sm={6}>
              <TextField
                sx={{ width: 230 }}
                fullWidth
                label="First Name *"
                required
                value={form.firstname}
                onChange={(e) => handleChange("firstname", e.target.value)}
                error={!!errors.firstname}
                helperText={errors.firstname}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                sx={{ width: 230 }}
                fullWidth
                label="Last Name"
                required
                value={form.lastname}
                onChange={(e) => handleChange("lastname", e.target.value)}
                error={!!errors.lastname}
                helperText={errors.lastname}
              />
            </Grid>

            {/* Row 2 */}
            <Grid item xs={12} sm={6} sx={{ width: 230 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                  row
                  value={form.gender || "Male"}
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <FormControlLabel
                    value="Male"
                    control={<Radio />}
                    label="Male"
                  />
                  <FormControlLabel
                    value="Female"
                    control={<Radio />}
                    label="Female"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                sx={{ width: 230 }}
                label="Father's / Husband's Name"
                value={form.fathername}
                onChange={(e) => handleChange("fathername", e.target.value)}
              />
            </Grid>

            {/* Row 3 */}
            <Grid item xs={12} sm={6} sx={{ width: 230 }}>
              <TextField
                fullWidth
                sx={{ width: 230 }}
                label="Mobile *"
                value={form.mobile}
                onChange={(e) => handleChange("mobile", e.target.value)}
                error={!!errors.mobile}
                helperText={errors.mobile || "Exactly 10 digits"}
                inputProps={{ maxLength: 10 }}
                InputProps={{
                  startAdornment: (
                    <PhoneIcon sx={{ color: "text.secondary", mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Alternate Mobile"
                value={form.mobile2}
                onChange={(e) => handleChange("mobile2", e.target.value)}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>

            {/* Row 4 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                sx={{ width: 230 }}
                label="Phone"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                sx={{ width: 230 }}
                label="Alternate Phone"
                value={form.phone2}
                onChange={(e) => handleChange("phone2", e.target.value)}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>

            {/* Row 5 - Address Line 1 (Full Width) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                sx={{ width: 230 }}
                label="Address"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                multiline
              />
            </Grid>

            {/* Row 6 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                sx={{ width: 230 }}
                label="Address Line 2"
                value={form.address2}
                onChange={(e) => handleChange("address2", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                sx={{ width: 230 }}
                fullWidth
                label="Category"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Staff">Staff</MenuItem>
                <MenuItem value="VIP">VIP</MenuItem>
                <MenuItem value="NRI">NRI</MenuItem>
              </TextField>
            </Grid>

            {/* Row 7 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                sx={{ width: 230 }}
                label="Reference"
                value={form.reference}
                onChange={(e) => handleChange("reference", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                sx={{ width: 230 }}
                label="ID Proof (Aadhaar/PAN etc)"
                value={form.idproof}
                onChange={(e) => handleChange("idproof", e.target.value)}
              />
            </Grid>

            {/* Row 8 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Old ID (if any)"
                value={form.oldid}
                onChange={(e) => handleChange("oldid", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                sx={{ width: 230 }}
                fullWidth
                label="Introducer Name"
                value={form.introname}
                onChange={(e) => handleChange("introname", e.target.value)}
              />
            </Grid>

            {/* Row 9 */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                sx={{ width: 230 }}
                label="Shares"
                type="number"
                value={form.shares}
                onChange={(e) => handleChange("shares", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                sx={{ width: 230 }}
                fullWidth
                label="Loan Limit"
                type="number"
                value={form.loanlimit}
                onChange={(e) => handleChange("loanlimit", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                sx={{ width: 230 }}
                label="Age"
                type="number"
                value={form.age}
                onChange={(e) => handleChange("age", e.target.value)}
              />
            </Grid>

            {/* Row 10 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                sx={{ width: 230 }}
                label="Occupation"
                value={form.occupation}
                onChange={(e) => handleChange("occupation", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                sx={{ width: 230 }}
                label="Spouse Name"
                value={form.spouse}
                onChange={(e) => handleChange("spouse", e.target.value)}
              />
            </Grid>

            {/* Row 11 - Switches */}
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
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.bussinessexemption}
                    onChange={(e) =>
                      handleChange("bussinessexemption", e.target.checked)
                    }
                  />
                }
                label="Business Exemption"
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box
            sx={{ mt: 6, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            <Button
              variant="outlined"
              size="large"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              sx={{ minWidth: 140 }}
            >
              {isEdit ? "Update Customer" : "Save Customer"}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
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
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Customer;
