import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  Box,
  Container,
  Button,
} from "@mui/material";
import { Search as SearchIcon, ShoppingCart as CartIcon, AccountCircle } from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import { useCart } from "../../context/CartContext";

/* =====================
   Styled Search
===================== */

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      width: "20ch",
      "&:focus": {
        width: "30ch",
      },
    },
  },
}));

/* =====================
        Navbar
===================== */

export default function Navbar() {
  const navigate = useNavigate();
  const { cartItemCount } = useCart();

  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  /* ===== Auth Info ===== */
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = Boolean(token);

  /* ===== Menu Handlers ===== */
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    handleMenuClose();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  const isMenuOpen = Boolean(anchorEl);

  return (
    <AppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ mr: 2, fontWeight: 700, color: "inherit", textDecoration: "none" }}
          >
            🛍️ E-Commerce
          </Typography>

          {/* Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Button component={Link} to="/products" sx={{ color: "white" }}>
              Products
            </Button>
            <Button component={Link} to="/categories" sx={{ color: "white" }}>
              Categories
            </Button>
          </Box>

          {/* Search */}
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <form onSubmit={handleSearch}>
              <StyledInputBase
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </Search>

          {/* Cart */}
          <IconButton color="inherit" component={Link} to="/cart" sx={{ ml: 2 }}>
            <Badge badgeContent={cartItemCount} color="error">
              <CartIcon />
            </Badge>
          </IconButton>

          {/* ================= USER MENU ================= */}

          {isLoggedIn ? (
            <>
              {/* User Name Button */}
              <Button
                color="inherit"
                onClick={handleProfileMenuOpen}
                sx={{ textTransform: "none", ml: 1 }}
                startIcon={<AccountCircle />}
              >
                {user?.firstName} {user?.lastName}
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                  Profile
                </MenuItem>

                <MenuItem component={Link} to="/orders" onClick={handleMenuClose}>
                  My Orders
                </MenuItem>

                {user?.role === "admin" && (
                  <MenuItem component={Link} to="/admin" onClick={handleMenuClose}>
                    Admin
                  </MenuItem>
                )}

                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              {/* Not logged in */}
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/register"
                variant="outlined"
                sx={{ ml: 1, borderColor: "white", color: "white" }}
              >
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
