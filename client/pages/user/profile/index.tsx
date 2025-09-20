import React from "react";
import {  Box,  Typography,  Avatar,  Divider,  List,  ListItemButton,  ListItemIcon,  ListItemText,  IconButton,  Drawer,  Button,} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BookmarksOutlinedIcon from "@mui/icons-material/BookmarksOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/router";
import { useUserProfile } from "@/customHooks/query/auth.query";
import { useUserStore } from "@/utils/store/store";


interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ open, onClose }) => {
  const router = useRouter();
  const { data, isLoading, isError } = useUserProfile();
  const { logout } = useUserStore();
  

  const user = data?.user;

  const handleBack = () => {
    onClose();
  };

  const handleUpdatePassword = () => {
    onClose();
    router.push("/user/update-password");
  };

  const handleLogout = () => {
    logout();
    router.push("/user/login");
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100vw", sm: 380 },
          maxWidth: "100vw",
          boxShadow: 4,
          bgcolor: "#faf7f0",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        },
      }}
    >
      <Box sx={{ p: 2, px: 3, pt: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Profile
          </Typography>
        </Box>

        {/* User Info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: "#bdaeef",
              color: "#4b3e74",
              width: 70,
              height: 70,
              fontWeight: "bold",
              fontSize: 36,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="#222">
              {user?.name ?? "User"}
            </Typography>
            <Typography variant="body2" color="#666" fontWeight={500}>
              {user?.email ?? "No email"}
            </Typography>

            {/* Add Update Password Button here */}
            <Button
              variant="outlined"
              sx={{
                mt: 2,
                borderColor: "#7e6020",
                color: "#7e6020",
                fontWeight: "bold",
                textTransform: "none",
              }}
              onClick={handleUpdatePassword}
              fullWidth
              size="small"
            >
              Update Password
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Menu Items */}
        <List sx={{ flexGrow: 1 }}>
          <ListItemButton onClick={() => { onClose(); router.push("/user/bookings"); }}>
            <ListItemIcon sx={{ color: "#7e6020" }}>
              <BookmarksOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="View all bookings" />
          </ListItemButton>

          

          <ListItemButton onClick={() => { onClose(); router.push("/terms"); }}>
            <ListItemIcon sx={{ color: "#7e6020" }}>
              <DescriptionOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Terms & Conditions" />
          </ListItemButton>

          <ListItemButton onClick={() => { onClose(); router.push("/privacy"); }}>
            <ListItemIcon sx={{ color: "#7e6020" }}>
              <PrivacyTipOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Privacy Policy" />
          </ListItemButton>
        </List>

        {/* Logout */}
        <List>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ color: "#7e6020" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
};

export default ProfileDrawer;
