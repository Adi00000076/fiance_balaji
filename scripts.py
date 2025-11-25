import { useState, useEffect } from "react";
import axiosInstance from "__api__/axiosInstance";
import API_CONFIG from "__api__/config";
import { MatxLoading } from "app/components";
import { successToast, errorToast } from "../../utils/toastUtils";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Drawer,
  Grid,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CancelIcon from "@mui/icons-material/Cancel";

const Overview_Rail_page = () => {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [wagonTypes, setWagonTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [contractNoList, setContractNoList] = useState([]);
  const [parties, setParties] = useState([]);

  const initialFormData = {
    indentNo: "",
    contractNo: "",
    typeOfWagon: "",
    noOfWagons: "",
    totalQuantity: "",
    scheduledLoadDateTime: null,
    fromLocation: "",
    toLocation: "",
    fnrNumber: "",
    party: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  // Fetch data from APIs
  const fetchData = async () => {
    setLoading(true);
    try {
      const [rakeRes, wagonRes, locationRes, contractRes, partyRes] =
        await Promise.all([
          axiosInstance
            .get(`${API_CONFIG.BASE_URL}/menu/rakeOperations/getList`, {
              headers: API_CONFIG.HEADERS,
              timeout: API_CONFIG.TIMEOUT,
            })
            .catch((err) => {
              console.error("Rake Operations API failed:", err);
              return { data: [] };
            }),
          axiosInstance
            .get(`${API_CONFIG.BASE_URL}/admin/train/wagonType`, {
              headers: API_CONFIG.HEADERS,
              timeout: API_CONFIG.TIMEOUT,
            })
            .catch((err) => {
              console.error("Wagon Type API failed:", err);
              return { data: [] };
            }),
          axiosInstance
            .get(`${API_CONFIG.BASE_URL}/admin/commercial/location`, {
              headers: API_CONFIG.HEADERS,
              timeout: API_CONFIG.TIMEOUT,
            })
            .catch((err) => {
              console.error("Locations API failed:", err);
              return { data: [] };
            }),
          axiosInstance
            .get(`${API_CONFIG.BASE_URL}/admin/train/contractDetails`, {
              headers: API_CONFIG.HEADERS,
              timeout: API_CONFIG.TIMEOUT,
            })
            .catch((err) => {
              console.error("Contract Details API failed:", err);
              return { data: [] };
            }),
          axiosInstance
            .get(`${API_CONFIG.BASE_URL}/menu/commercial/party`, {
              headers: API_CONFIG.HEADERS,
              timeout: API_CONFIG.TIMEOUT,
            })
            .catch((err) => {
              console.error("Party API failed:", err);
              return { data: [] };
            }),
        ]);

      // Log raw data for debugging
      console.log(
        "Raw Rake Data from /menu/rakeOperations/getList:",
        rakeRes.data
      );
      console.log("Raw Party Data from /menu/commercial/party:", partyRes.data);

      // Normalize parties data
      const normalizedParties =
        (partyRes.data || []).length > 0
          ? (partyRes.data || []).map((party, idx) => ({
              id: party.id || party.partyId || `party-${idx}`,
              name:
                party.name ||
                party.partyName ||
                (typeof party === "string" ? party : `Party ${idx + 1}`),
            }))
          : [];
      setParties(normalizedParties);
      if (normalizedParties.length === 0) {
        console.warn("No parties fetched from /menu/commercial/party");
        errorToast("No parties available. Please check the party data source.");
      }

      // Process rake list with party mapping
      const rowsWithId = (rakeRes.data || []).map((row, index) => {
        const partyObj = normalizedParties.find(
          (p) => p.id === row.party || p.id === row.partyId
        );
        console.log(`Row ${index}:`, {
          rowParty: row.party,
          rowPartyName: row.partyName,
          matchedParty: partyObj,
        });
        return {
          id:
            row.id ??
            `${row.contractNo || "no-contract"}-${
              row.scheduledLoadDateTime || "no-dt"
            }-${index}`,
          ...row,
          party: partyObj ? partyObj.name : row.partyName || row.party || "N/A",
        };
      });
      setRows(rowsWithId);
      console.log(
        "Total Records from /menu/rakeOperations/getList:",
        rowsWithId.length
      );
      console.log("Processed Rows:", rowsWithId);

      // Normalize contract numbers
      const normalizedContracts = (contractRes.data || []).map(
        (contract, idx) => {
          if (typeof contract === "string") {
            return { id: contract, number: contract };
          }
          return {
            id: contract.id || contract.contractNo || `contract-${idx}`,
            number:
              contract.contractNo || contract.number || `Contract ${idx + 1}`,
          };
        }
      );
      setContractNoList(normalizedContracts);

      setWagonTypes(wagonRes.data || []);
      setLocations(locationRes.data || []);

      console.log("Raw Contract Data:", contractRes.data);
      console.log("Normalized Contracts:", normalizedContracts);
      console.log("Wagon Types:", wagonRes.data);
      console.log("Locations:", locationRes.data);
      console.log("Normalized Parties:", normalizedParties);
    } catch (error) {
      console.error("Unexpected error fetching data:", error);
      if (error.code === "ECONNABORTED") {
        errorToast("Request timed out. Please try again later.");
      } else {
        errorToast(error.response?.data?.message || "Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Save new rake without validation
  const handleSave = async () => {
    try {
      const partyObj = parties.find((p) => p.id === formData.party);
      const normalizedDT = formData.scheduledLoadDateTime
        ? formData.scheduledLoadDateTime.toISOString()
        : null;
      const payload = {
        indentNo: formData.indentNo || null,
        contractNo: formData.contractNo || null,
        typeOfWagon: formData.typeOfWagon || null,
        noOfWagons: formData.noOfWagons ? Number(formData.noOfWagons) : null,
        totalQuantity: formData.totalQuantity
          ? Number(formData.totalQuantity)
          : null,
        scheduledLoadDateTime: normalizedDT,
        fromLocation: formData.fromLocation || null,
        toLocation: formData.toLocation || null,
        fnrNumber: formData.fnrNumber || null,
        party: partyObj ? partyObj.name : formData.party || null, // Send name if backend expects name; adjust as needed
      };
      console.log("Saving Rake with payload:", payload);
      const res = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}/menu/rakeOperations/saveRakeOperation`,
        payload,
        { headers: API_CONFIG.HEADERS }
      );
      successToast(res.data?.message || "Rake Saved Successfully!");
      setFormData(initialFormData);
      setDrawerOpen(false);
      await fetchData(); // Refetch data after save
    } catch (error) {
      console.error("Error saving rake:", error);
      if (error.code === "ECONNABORTED") {
        errorToast("Request timed out. Please try again later.");
      } else {
        errorToast(error.response?.data?.message || "Failed to save rake");
      }
    }
  };

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed to:`, value);
    setFormData({ ...formData, [name]: value });
  };

  const handleDateTimeChange = (newValue) => {
    console.log("Scheduled Load DateTime changed to:", newValue);
    setFormData({ ...formData, scheduledLoadDateTime: newValue });
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredRows = rows.filter((row) =>
    Object.values(row)
      .filter((val) => typeof val === "string" || typeof val === "number")
      .some((val) =>
        val.toString().toLowerCase().includes(searchText.toLowerCase())
      )
  );

  // DataGrid columns
  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 300,
      sortable: true,
      renderCell: (params) => (
        <Grid container spacing={1} justifyContent="start">
          <Grid item>
            <Tooltip title="View">
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<VisibilityIcon />}
                onClick={() =>
                  navigate(`/RailNew/Rail_View/${params.row.rakeOperationsId}`)
                }
              ></Button>
            </Tooltip>
          </Grid>

          <Grid item>
            <Tooltip title="Load">
              <Button
                size="small"
                variant="contained"
                color="info"
                startIcon={<UploadIcon />}
                onClick={() =>
                  navigate(`/RailNew/load/${params.row.rakeOperationsId}`)
                }
              ></Button>
            </Tooltip>
          </Grid>

          <Grid item>
            <Tooltip title="Discharge">
              <Button
                size="small"
                variant="contained"
                color="warning"
                startIcon={<DownloadIcon />}
                onClick={() =>
                  navigate(`/RailNew/discharge/${params.row.rakeOperationsId}`)
                }
              ></Button>
            </Tooltip>
          </Grid>
        </Grid>
      ),
    },

    {
      field: "indentNo",
      headerName: "Indent No",
      minWidth: 140,
      flex: 1,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "contractNo",
      headerName: "Contract No",
      minWidth: 140,
      flex: 1,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "party",
      headerName: "Party",
      minWidth: 70,
      flex: 1,
      renderCell: (params) => {
        if (!parties.length) return "No parties available";
        const partyObj = parties.find((p) => p.id === params.value);
        return partyObj ? partyObj.name : params.value || "N/A";
      },
    },
    {
      field: "typeOfWagon",
      headerName: "Type of Wagon",
      minWidth: 140,
      flex: 1,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "noOfWagons",
      headerName: "No of Wagons",
      minWidth: 140,
      flex: 1,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "totalQuantity",
      headerName: "Total Quantity (MT)",
      minWidth: 140,
      flex: 1,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "scheduledLoadDateTime",
      headerName: "Scheduled Load Date",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "fromLocation",
      headerName: "From Location",
      minWidth: 140,
      flex: 1,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "toLocation",
      headerName: "To Location",
      minWidth: 140,
      flex: 1,
      renderCell: (params) => params.value || "N/A",
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 4 }}>
        {loading && <MatxLoading />}

        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardHeader
            sx={{ backgroundColor: (theme) => theme.palette.grey[100], py: 1 }}
            title={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flex: 1,
                  }}
                >
                  <ListAltIcon color="primary" />
                  <Typography variant="h6">Rail Overview</Typography>
                </Box>
                <Box
                  sx={{ flex: 2, display: "flex", justifyContent: "center" }}
                >
                  <TextField
                    size="small"
                    label="Search"
                    variant="outlined"
                    value={searchText}
                    onChange={handleSearch}
                    sx={{ width: 300 }}
                    placeholder="Search all fields..."
                  />
                </Box>
                <Box
                  sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setDrawerOpen(true)}
                  >
                    + Create
                  </Button>
                </Box>
              </Box>
            }
          />

          <CardContent>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              disableColumnMenu
              sx={{
                height: 400,
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#232a46",
                  color: "white",
                },
              }}
              disableRowSelectionOnClick
              loading={loading}
              getRowId={(row) => row.id}
              pagination
              pageSizeOptions={[5, 10, 15]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5, page: 0 } },
              }}
            />
          </CardContent>
        </Card>

        {/* Drawer Form */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ width: 500, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🚆 Rail Creation
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Indent No"
                  name="indentNo"
                  value={formData.indentNo}
                  onChange={handleChange}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Contract No"
                  name="contractNo"
                  value={formData.contractNo}
                  onChange={handleChange}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: { maxHeight: 200, overflowY: "auto" },
                      },
                    },
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {contractNoList.length > 0 ? (
                    contractNoList.map((contract) => (
                      <MenuItem key={contract.id} value={contract.id}>
                        {contract.number}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No contract numbers available</MenuItem>
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Party"
                  name="party"
                  value={formData.party}
                  onChange={handleChange}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: { maxHeight: 200, overflowY: "auto" },
                      },
                    },
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {parties.length > 0 ? (
                    parties.map((party) => (
                      <MenuItem key={party.id} value={party.id}>
                        {party.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No parties available</MenuItem>
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Type of Wagon"
                  name="typeOfWagon"
                  value={formData.typeOfWagon}
                  onChange={handleChange}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: { maxHeight: 200, overflowY: "auto" },
                      },
                    },
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {wagonTypes.length > 0 ? (
                    wagonTypes.map((opt, idx) => (
                      <MenuItem key={idx} value={opt}>
                        {opt}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No wagon types available</MenuItem>
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="No. of Wagons"
                  name="noOfWagons"
                  type="number"
                  value={formData.noOfWagons}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="FNR Number"
                  name="fnrNumber"
                  value={formData.fnrNumber}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Quantity (MT)"
                  name="totalQuantity"
                  type="number"
                  value={formData.totalQuantity}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <DateTimePicker
                  sx={{ width: "100%" }}
                  label="Scheduled Load Date & Time"
                  value={formData.scheduledLoadDateTime}
                  onChange={handleDateTimeChange}
                  ampm={false}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="From Location"
                  name="fromLocation"
                  value={formData.fromLocation}
                  onChange={handleChange}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: { maxHeight: 200, overflowY: "auto" },
                      },
                    },
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {locations.length > 0 ? (
                    locations.map((opt, idx) => (
                      <MenuItem key={idx} value={opt}>
                        {opt}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No locations available</MenuItem>
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="To Location"
                  name="toLocation"
                  value={formData.toLocation}
                  onChange={handleChange}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: { maxHeight: 200, overflowY: "auto" },
                      },
                    },
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {locations.length > 0 ? (
                    locations.map((opt, idx) => (
                      <MenuItem key={idx} value={opt}>
                        {opt}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No locations available</MenuItem>
                  )}
                </TextField>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={loading}
              >
                Save Rake
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => {
                  setFormData(initialFormData);
                  setDrawerOpen(false);
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Drawer>
      </Box>
    </LocalizationProvider>
  );
};

export default Overview_Rail_page;
