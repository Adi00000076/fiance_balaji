import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, Paper, Typography } from "@mui/material";
import { Person, Work, Groups, Storefront } from "@mui/icons-material";

import Custmer from "./Custmer/Custmer";
import Partner from "./Partner/Partner";
import Employe from "./Employe/Employe";
import Vender from "./Vender/Vender";

import LoadingSpinner from "../../../LoadingSpinner";

const Main_personal_file = () => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setLoading(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [value]);

  const tabBgColor = "#0f172a";
  const activeTabColor = "#3b82f6";
  const inactiveTabColor = "#94a3b8";
  const indicatorColor = "#60a5fa";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Paper elevation={8}>
        <Tabs
          value={value}
          onChange={handleChange}
          centered
          variant="fullWidth"
          sx={{
            bgcolor: tabBgColor,
            "& .MuiTabs-indicator": {
              backgroundColor: indicatorColor,
              height: 4,
              borderRadius: "2px",
            },
          }}
        >
          <Tab
            icon={<Person sx={{ fontSize: 28 }} />}
            label={
              <Typography variant="subtitle1" fontWeight="600">
                Customer
              </Typography>
            }
            iconPosition="start"
            sx={{ color: value === 0 ? activeTabColor : inactiveTabColor }}
          />

          <Tab
            icon={<Work sx={{ fontSize: 28 }} />}
            label={
              <Typography variant="subtitle1" fontWeight="600">
                Employee
              </Typography>
            }
            iconPosition="start"
            sx={{ color: value === 1 ? activeTabColor : inactiveTabColor }}
          />

          <Tab
            icon={<Groups sx={{ fontSize: 28 }} />}
            label={
              <Typography variant="subtitle1" fontWeight="600">
                Partner
              </Typography>
            }
            iconPosition="start"
            sx={{ color: value === 2 ? activeTabColor : inactiveTabColor }}
          />

          <Tab
            icon={<Storefront sx={{ fontSize: 28 }} />}
            label={
              <Typography variant="subtitle1" fontWeight="600">
                Vendor
              </Typography>
            }
            iconPosition="start"
            sx={{ color: value === 3 ? activeTabColor : inactiveTabColor }}
          />
        </Tabs>
      </Paper>

      {/* CONTENT AREA WITH SPINNER */}
      <Box sx={{ mt: 3, minHeight: "300px" }}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {value === 0 && <Custmer personType="CUSTOMER" />}
            {value === 1 && <Employe personType="EMPLOYEE" />}
            {value === 2 && <Partner personType="PARTNER" />}
            {value === 3 && <Vender personType="VENDOR" />}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Main_personal_file;
