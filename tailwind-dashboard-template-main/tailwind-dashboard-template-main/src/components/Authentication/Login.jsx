import React, { useState } from "react";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  CssBaseline,
  Grid,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";

import {
  LockOutlined as LockOutlinedIcon,
  AccountCircle as AccountCircleIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import shribalajifinance from "../../images/shri-balaji-finance.png";

// FULL BACKGROUND IMAGE
import leftSideImage from "../../images/left-bg.jpg";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { successToast, errorToast } from "../../toastify";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8881/balaji-finance";

const theme = createTheme({
  palette: {
    primary: { main: "#0ea5a0" },
    text: { primary: "#0f172a" },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h4: { fontWeight: 700 },
  },
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.username,
          password: formData.password,
        }),
      });

      const data = await resp.json();

      if (resp.ok && (data.token || data.user)) {
        const token = data.token || data.accessToken;
        if (token) localStorage.setItem("token", token);

        login({
          name: data.name || data.user?.name || formData.username,
          role: data.role || "user",
          token,
        });

        successToast("Login Successful");
        navigate("/", { replace: true });
      } else {
        errorToast(data.message || "Invalid credentials");
      }
    } catch (error) {
      errorToast("Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* FULL BACKGROUND */}
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          background: `url(${leftSideImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end", // 👈 MOVE CARD RIGHT
          pr: 2, // 👈 small padding on right
        }}
      >
        {/* LEFT SIDE LOGIN CARD */}
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: 430,
            p: 5,
            borderRadius: 4,
            background: "white",
          }}
        >
          <Box textAlign="center">
            <Avatar
              sx={{
                bgcolor: "primary.main",

                margin: "auto",
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 36 }} />
            </Avatar>

            <Box sx={{ textAlign: "center", mt: 4 }}>
              <img
                src={shribalajifinance}
                alt="Balaji Finance"
                style={{
                  height: 100,
                  width: "70%",
                  margin: "0 auto", // centers horizontally
                  display: "block", // required for margin auto to work
                }}
              />
            </Box>

            <Typography variant="h4" sx={{ mt: 2 }}>
              Sign In
            </Typography>

            <Typography color="text.secondary">
              Welcome back! Please login to continue.
            </Typography>
          </Box>

          {/* FORM */}
          <Box component="form" onSubmit={handleSubmit} mt={3}>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={formData.username}
              onChange={handleChange("username")}
              error={!!errors.username}
              helperText={errors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              margin="normal"
              value={formData.password}
              onChange={handleChange("password")}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ mt: 3, py: 1.3, fontWeight: 600 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </Box>

          <Typography textAlign="center" sx={{ mt: 3 }} color="text.secondary">
            © {new Date().getFullYear()} Balaji Finance
          </Typography>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
