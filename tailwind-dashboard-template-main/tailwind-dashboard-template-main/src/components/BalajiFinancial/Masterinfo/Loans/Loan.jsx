import React, { useState, lazy, Suspense } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { motion } from "framer-motion";

// React Icons
import { MdCalendarMonth, MdCalendarToday } from "react-icons/md";

// Lazy load pages
const MonthlyFinance = lazy(() => import("./MonthlyFinance/MonthlyFinance"));
const DailyFinance = lazy(() => import("./DailyFinance/DailyFinace"));

const Loan = () => {
  const [activeTab, setActiveTab] = useState("monthly");

  const tabs = [
    {
      id: "monthly",
      label: "Monthly Finance",
      icon: <MdCalendarMonth size={18} />,
    },
    {
      id: "daily",
      label: "Daily Finance",
      icon: <MdCalendarToday size={18} />,
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      {/* Modern MUI Animated Tabs */}
      <Paper
        elevation={2}
        sx={{
          display: "flex",
          gap: 2,
          p: 1,
          width: "fit-content",
          borderRadius: "50px",
          position: "relative",
          mb: 3,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Box
              key={tab.id}
              sx={{
                position: "relative",
                px: 3,
                py: 1,
                borderRadius: "50px",
                cursor: "pointer",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "white" : "text.secondary",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {/* Animated Background */}
              {isActive && (
                <motion.div
                  layoutId="pill"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 50,
                    backgroundColor: "#1976d2",
                  }}
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}

              {/* Icon + Label */}
              <Box
                sx={{
                  position: "relative",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {tab.icon}
                <Typography variant="body1">{tab.label}</Typography>
              </Box>
            </Box>
          );
        })}
      </Paper>

      {/* Tab Content */}
      <Suspense fallback={<Typography>Loading...</Typography>}>
        {activeTab === "monthly" && <MonthlyFinance />}
        {activeTab === "daily" && <DailyFinance />}
      </Suspense>
    </Box>
  );
};

export default Loan;
