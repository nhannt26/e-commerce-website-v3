import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Box, Typography, TextField, Button, Stack } from "@mui/material";
import { toast } from "react-hot-toast";
import { authAPI } from "../services/api"; // 👈 import đúng authAPI

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const { firstName, lastName, email, phone, password, confirmPassword } = form;

    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      toast.error("All fields are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format");
      return false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Confirm password does not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      await authAPI.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      toast.success("Register successful! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={3} align="center">
          Create Account
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                required
                value={form.firstName}
                onChange={handleChange}
              />
              <TextField
                label="Last Name"
                name="lastName"
                fullWidth
                required
                value={form.lastName}
                onChange={handleChange}
              />
            </Stack>

            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={handleChange}
            />

            <TextField
              label="Phone"
              name="phone"
              fullWidth
              required
              value={form.phone}
              onChange={handleChange}
              inputProps={{ maxLength: 10 }}
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              required
              value={form.password}
              onChange={handleChange}
            />

            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              fullWidth
              required
              value={form.confirmPassword}
              onChange={handleChange}
            />

            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>

            <Typography variant="body2" align="center">
              Already have an account?{" "}
              <Link to="/login" style={{ textDecoration: "none" }}>
                Login
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;
