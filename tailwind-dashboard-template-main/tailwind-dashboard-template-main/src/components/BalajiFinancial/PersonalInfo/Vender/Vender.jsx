import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

const Vender = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get("/balaji-finance/PersonalInfo/findAll");
      setRows(response.data);
    } catch (err) {
      setError("Failed to load customer data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "firstname", headerName: "First Name", width: 150 },
    { field: "lastname", headerName: "Last Name", width: 150 },
    { field: "gender", headerName: "Gender", width: 100 },
    { field: "fathername", headerName: "Father Name", width: 180 },
    { field: "address", headerName: "Address", width: 200 },
    { field: "mobile", headerName: "Mobile", width: 150 },
    { field: "phone", headerName: "Phone", width: 150 },
    { field: "category", headerName: "Category", width: 120 },
    { field: "reference", headerName: "Reference", width: 150 },
    { field: "idproof", headerName: "ID Proof", width: 150 },
    { field: "disable", headerName: "Disabled", width: 100, type: "boolean" },
    { field: "shares", headerName: "Shares", width: 120, type: "number" },
    {
      field: "loanlimit",
      headerName: "Loan Limit",
      width: 150,
      type: "number",
    },
    { field: "address2", headerName: "Address 2", width: 180 },
    { field: "mobile2", headerName: "Mobile 2", width: 150 },
    { field: "phone2", headerName: "Phone 2", width: 150 },
    { field: "oldid", headerName: "Old ID", width: 120 },
    { field: "age", headerName: "Age", width: 80 },
    { field: "occupation", headerName: "Occupation", width: 150 },
    { field: "spouse", headerName: "Spouse", width: 150 },
    {
      field: "bussinessexemption",
      headerName: "Business Exemption",
      width: 180,
      type: "boolean",
    },
    { field: "introname", headerName: "Intro Name", width: 150 },
  ];

  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Vender List
      </Typography>

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && (
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id ?? Math.random()}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      )}
    </Box>
  );
};

export default Vender;
