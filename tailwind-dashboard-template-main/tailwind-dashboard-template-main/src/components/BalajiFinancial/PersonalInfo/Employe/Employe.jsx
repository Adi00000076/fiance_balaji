// src/components/BalajiFinancial/PersonalInfo/Employe/Employe.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  Grid,
  TextField,
  Paper,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

import {
  FiUserPlus,
  FiSearch,
  FiPhone,
  FiCopy,
  FiSave,
  FiX,
  FiEdit,
  FiTrash2,
  FiXCircle,
} from "react-icons/fi";
import { MdClose } from "react-icons/md";
import { successToast, errorToast } from "../../../../toastify";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8881/balaji-finance";

const TYPE_LABELS = {
  CUSTOMER: "Customer",
  EMPLOYEE: "Employee",
  PARTNER: "Partner",
  VENDOR: "Vendor",
};

const Employe = ({ personType = "EMPLOYEE" }) => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState("");

  const [form, setForm] = useState({
    id: "",
    firstname: "",
    lastname: "",
    fathername: "",
    spouse: "",
    gender: "Male",
    age: "",
    occupation: "",
    address: "",
    address2: "",
    mobile: "",
    mobile2: "",
    phone: "",
    reference: "",
    idproof: "",
    category: personType,
  });

  const [errors, setErrors] = useState({});

  /* FETCH DATA */
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/PersonalInfo/findAll`);
      console.log("Raw API Response:", res.data); // Debug log

      let data = Array.isArray(res.data) ? res.data : [];
      data = data.filter((item) => item.category === personType); // Filter by type

      // Fix ID: use real ID or fallback safely
      const safeData = data.map((item, index) => ({
        ...item,
        id: item.id || `BALAJI-${index}-${Date.now()}`,
        category: item.category || personType,
      }));

      console.log("Processed Rows:", safeData); // Final data sent to grid
      setRows(safeData);
    } catch (err) {
      console.error("Fetch error:", err);
      errorToast("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [personType]);

  useEffect(() => {
    const filtered = rows.filter(
      (r) =>
        (r.firstname || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.mobile || "").includes(search) ||
        (r.id || "").includes(search)
    );
    setFilteredRows(filtered);
  }, [rows, search]);

  /* OPEN ADD FORM */
  const openAddForm = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/PersonalInfo/createNewPersonalInfoTemplate/${personType}`
      );
      setForm({
        id: res.data.id || "",
        firstname: "",
        lastname: "",
        fathername: "",
        spouse: "",
        gender: "Male",
        age: "",
        occupation: "",
        address: "",
        address2: "",
        mobile: "",
        mobile2: "",
        phone: "",
        reference: "",
        idproof: "",
        category: personType,
      });
      setErrors({});
      setIsEdit(false);
      setDrawerOpen(true);
    } catch (err) {
      console.error("Failed to generate ID:", err);
      errorToast("Failed to generate ID");
    } finally {
      setLoading(false);
    }
  };

  /* INPUT CHANGE - Fixed syntax */
  const handleChange = (field, value) => {
    if (["mobile", "mobile2", "phone"].includes(field)) {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    if (field === "age") {
      value = value === "" ? "" : Math.max(0, parseInt(value) || 0).toString();
    }

    setForm((prev) => ({ ...prev, [field]: value }));

    // Live validation
    if (field === "mobile") {
      if (!value) {
        setErrors((prev) => ({ ...prev, mobile: "Mobile is required" }));
      } else if (value.length !== 10) {
        setErrors((prev) => ({ ...prev, mobile: "Must be 10 digits" }));
      } else {
        setErrors((prev) => ({ ...prev, mobile: undefined }));
      }
    }
    if (field === "firstname" && value.trim()) {
      setErrors((prev) => ({ ...prev, firstname: undefined }));
    }
  };

  /* VALIDATION */
  const validateForm = () => {
    const newErrors = {};
    if (!form.firstname?.trim()) newErrors.firstname = "First Name is required";
    if (!form.mobile) newErrors.mobile = "Mobile is required";
    else if (form.mobile.length !== 10) newErrors.mobile = "Must be 10 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* SUBMIT */
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/PersonalInfo/updatePersonalInfo`, {
        ...form,
        category: personType,
      });
      successToast(`${isEdit ? "Updated" : "Added"} successfully!`);
      setDrawerOpen(false);
      fetchData();
    } catch (err) {
      errorToast(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* DELETE */
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/PersonalInfo/deletePersonalInfo`, {
        data: { id: toDeleteId },
      });
      successToast("Deleted successfully");
      fetchData();
    } catch (err) {
      errorToast("Delete failed");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  /* COPY ID */
  const copyId = () => {
    navigator.clipboard.writeText(form.id || "N/A");
    successToast("ID copied!");
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 180, // a bit wider so the Delete button fits nicely
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box
          sx={{ display: "flex", gap: 1, alignItems: "center", height: "100%" }}
        >
          {/* Edit Button */}
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<FiEdit />}
            onClick={() => {
              setForm(params.row);
              setIsEdit(true);
              setDrawerOpen(true);
            }}
          >
            Edit
          </Button>

          {/* Delete Button */}
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<FiTrash2 />}
            onClick={() => {
              setToDeleteId(params.row.id);
              setDeleteDialogOpen(true);
            }}
          >
            Delete
          </Button>
        </Box>
      ),
    },
    { field: "id", headerName: "ID", width: 160 },
    { field: "firstname", headerName: "First Name", width: 160 },
    { field: "lastname", headerName: "Last Name", width: 140 },
    { field: "mobile", headerName: "Mobile", width: 140 },
    { field: "address", headerName: "Address", flex: 1 },
  ];

  return (
    <Box sx={{ bgcolor: "#f9fafb", minHeight: "100vh", mt: 2 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {TYPE_LABELS[personType]}s
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.primary">
            Total: {filteredRows.length}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 320 }}
            InputProps={{
              startAdornment: (
                <FiSearch style={{ marginRight: 8, color: "#666" }} />
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<FiUserPlus />}
            onClick={openAddForm}
          >
            Add {TYPE_LABELS[personType]}
          </Button>
        </Box>
      </Box>

      {/* DataGrid */}
      <Paper elevation={3} sx={{ height: 680 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 25, 50, 100]}
          pagination
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Drawer Form - Same Perfect Layout */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: { xs: "100vw", sm: 600 }, p: 4, pb: 4 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography variant="h5" fontWeight="bold" color="primary">
              {isEdit ? "Edit" : "Add New"} {TYPE_LABELS[personType]}
            </Typography>
            <Button onClick={() => setDrawerOpen(false)} sx={{ minWidth: 40 }}>
              <MdClose size={28} />
            </Button>
          </Box>

          {/* Customer ID (Only in Edit Mode) */}
          {isEdit && (
            <Paper
              elevation={0}
              sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2, mb: 4 }}
            >
              <TextField
                fullWidth
                label="Employee ID"
                value={form.id || "N/A"}
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        startIcon={<FiCopy />}
                        onClick={copyId}
                      >
                        Copy
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>
          )}

          <Grid container spacing={3}>
            {/* Row 1 */}
            <Grid item xs={12} sm={4}>
              <TextField
                variant="outlined"
                label="First Name"
                required
                fullWidth
                value={form.firstname}
                onChange={(e) => handleChange("firstname", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                variant="outlined"
                label="Last Name"
                required
                fullWidth
                value={form.lastname}
                onChange={(e) => handleChange("lastname", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                variant="outlined"
                label="Father's / Husband's Name"
                required
                fullWidth
                value={form.fathername}
                onChange={(e) => handleChange("fathername", e.target.value)}
              />
            </Grid>

            {/* Row 2 */}
            <Grid item xs={12} sm={4}>
              <TextField
                variant="outlined"
                label="Spouse Name (if applicable)"
                required
                fullWidth
                value={form.spouse}
                onChange={(e) => handleChange("spouse", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                variant="outlined"
                label="Gender"
                required
                fullWidth
                value={form.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                label="Age"
                type="number"
                required
                fullWidth
                sx={{ width: 120 }}
                value={form.age}
                onChange={(e) => handleChange("age", e.target.value)}
                InputProps={{ inputProps: { min: 18, max: 100 } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                variant="outlined"
                label="ID Proof Type"
                required
                sx={{ width: 220 }}
                fullWidth
                value={form.idprooftype || "Aadhaar Card"}
                onChange={(e) => handleChange("idprooftype", e.target.value)}
              >
                <MenuItem value="Aadhaar Card">Aadhaar Card</MenuItem>
                <MenuItem value="PAN Card">PAN Card</MenuItem>
                <MenuItem value="Voter ID">Voter ID</MenuItem>
                <MenuItem value="Driving License">Driving License</MenuItem>
                <MenuItem value="Passport">Passport</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            {/* Row 3 */}
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                label="Occupation"
                required
                fullWidth
                value={form.occupation}
                onChange={(e) => handleChange("occupation", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                variant="outlined"
                label="ID Proof Number"
                required
                fullWidth
                value={form.idproof}
                onChange={(e) => handleChange("idproof", e.target.value)}
                placeholder={
                  form.idprooftype?.includes("Aadhaar")
                    ? "1234 5678 9012"
                    : "Enter ID number"
                }
              />
            </Grid>

            {/* Row 4 - Addresses */}
            <Grid item xs={12} sm={6}>
              <TextField
                sx={{ width: 225 }}
                variant="outlined"
                fullWidth
                required
                label="Residential Address"
                multiline
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                variant="outlined"
                sx={{ width: 225 }}
                fullWidth
                required
                label="Office / Alternate Address"
                multiline
                value={form.address2}
                onChange={(e) => handleChange("address2", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                fullWidth
                required
                label="Reference By "
                value={form.reference}
                onChange={(e) => handleChange("reference", e.target.value)}
                placeholder="e.g. Referred by Mr. Sharma"
              />
            </Grid>

            {/* Row 5 - Contact Numbers */}
            <Grid item xs={12} sm={4}>
              <TextField
                variant="outlined"
                fullWidth
                required
                label="Primary Mobile Number"
                value={form.mobile}
                onChange={(e) => handleChange("mobile", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                variant="outlined"
                fullWidth
                required
                label="Alternate Mobile Number"
                value={form.mobile2}
                onChange={(e) => handleChange("mobile2", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                variant="outlined"
                fullWidth
                required
                label="Landline / Residence Number (Optional)"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box
            sx={{
              mt: 6,
              pt: 4,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              position: "sticky",
              bottom: 0,
              bgcolor: "background.paper",
              zIndex: 1,
            }}
          >
            <Button
              variant="outlined"
              size="large"
              startIcon={<FiXCircle />}
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={saving ? <CircularProgress size={20} /> : <FiSave />}
              onClick={handleSubmit}
              disabled={saving}
              sx={{ minWidth: 140 }}
            >
              {saving ? "Saving..." : isEdit ? "Update" : "Save Customer"}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this record?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employe;
