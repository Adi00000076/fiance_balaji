import React, { useState } from "react";
import {

  Box,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import GroupsIcon from "@mui/icons-material/Groups";
import StoreIcon from "@mui/icons-material/Store";

import Custmer from "./Custmer/Custmer";
import Partner from "./Partner/Partner";
import Employe from "./Employe/Employe";
import Vender from "./Vender/Vender";

const Main_personal_file = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6" }}>

        

      {/* ----------------- TABS CARD ----------------- */}
      <Paper
        elevation={4}
    
      >
        <Tabs
          value={value}
          onChange={handleChange}
          centered
          aria-label="personal info tabs"
        
        >
          <Tab icon={<PersonIcon />} label="Customer" iconPosition="start" />
          <Tab icon={<WorkIcon />} label="Employee" iconPosition="start" />
          <Tab icon={<GroupsIcon />} label="Partner" iconPosition="start" />
          <Tab icon={<StoreIcon />} label="Vendor" iconPosition="start" />
        </Tabs>

        
      </Paper>

      {/* ----------------- PAGE CONTENT ----------------- */}
      <Box
      
      >
        {value === 0 && <Custmer />}
        {value === 1 && <Employe />}
        {value === 2 && <Partner />}
        {value === 3 && <Vender />}
      </Box>
    </Box>
  );
};

export default Main_personal_file;
