import { Grid, Paper, Typography, Box, CircularProgress } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice } from "../../utils/helpers";
import { useDashboard } from "../../hooks/useDashboard";

// Metric Card Component
function MetricCard({ title, value, icon, color }) {
  return (
    <Paper sx={{ p: 3, display: "flex", alignItems: "center", height: "100%" }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          bgcolor: `${color}.lighter`,
          color: `${color}.main`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mr: 2,
          fontSize: 26,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={600}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Typography color="error">Failed to load dashboard data</Typography>;
  }

  const { metrics, revenueByDay } = data;

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Dashboard
      </Typography>

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Total Revenue" value={formatPrice(metrics.totalRevenue)} icon="💰" color="primary" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Monthly Revenue" value={formatPrice(metrics.monthlyRevenue)} icon="📈" color="success" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Total Orders" value={metrics.totalOrders} icon="📦" color="info" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Total Products" value={metrics.totalProducts} icon="🛍️" color="warning" />
        </Grid>
      </Grid>

      {/* Revenue Chart */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Revenue (Last 7 Days)
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueByDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis tickFormatter={(v) => formatPrice(v)} />
            <Tooltip formatter={(v) => formatPrice(v)} />
            <Line type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
