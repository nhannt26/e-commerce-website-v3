import { useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useUsers, useUpdateUserRole } from "../../hooks/useUsers";

const ROLE_COLORS = {
  admin: "error",
  staff: "warning",
  user: "default",
  customer: "default",
};

export default function UserList() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useUsers(search);
  console.log(data);

  const updateRole = useUpdateUserRole();

  const users = data?.data?.results?.users ?? [];

  return (
    <Box>
      {/* Search */}
      <TextField
        size="small"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: 300 }}
      />

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell>Total Orders</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>

                {/* Role */}
                <TableCell>
                  <Chip label={user.role} color={ROLE_COLORS[user.role]} size="small" sx={{ mr: 1 }} />

                  <Select
                    size="small"
                    value={user.role}
                    onChange={(e) =>
                      updateRole.mutate({
                        id: user._id,
                        role: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="customer">Customer</MenuItem>
                  </Select>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Chip
                    label={user.isActive ? "Active" : "Blocked"}
                    color={user.isActive ? "success" : "error"}
                    size="small"
                  />
                </TableCell>

                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>

                <TableCell>{user.totalOrders}</TableCell>

                <TableCell align="right">{/* Future actions */}</TableCell>
              </TableRow>
            ))}

            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
