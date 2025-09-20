import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {  Paper,  Typography,  Box,  TextField,  Button,  IconButton,  InputAdornment,  Fade,} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { keyframes } from "@emotion/react";
import { useUpdatePassword } from "@/customHooks/query/auth.query";
import { UpdatePasswordRequest } from "@/typescript/auth.typescript";


const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const UpdatePassword: React.FC = () => {
  const { mutate, isPending } = useUpdatePassword();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdatePasswordRequest>({ mode: "onSubmit" });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const toggleShowOldPassword = () => setShowOldPassword((v) => !v);
  const toggleShowNewPassword = () => setShowNewPassword((v) => !v);

  const onSubmit: SubmitHandler<UpdatePasswordRequest> = (data) => {
    mutate(data, {
      onSuccess: (res) => {
        if (res.status) {
          reset();
        } 
      },
      
    });
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        bgcolor: "#fff",
        px: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 6,
          borderRadius: 3,
          background: "rgba(255, 255, 255, 0.9)", // translucent white glass effect
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          animation: `${fadeIn} 1s ease-out`,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          color="#7e6020"
          align="center"
          mb={4}
        >
          Update Password
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Fade in={!isPending} timeout={600}>
            <TextField
              label="Old Password"
              type={showOldPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              {...register("oldPassword", { required: "Old password is required" })}
              error={!!errors.oldPassword}
              helperText={errors.oldPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowOldPassword} edge="end" aria-label="toggle old password visibility">
                      {showOldPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              disabled={isPending}
              sx={{
                color: "#5c4314",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#7e6020" },
                  "&:hover fieldset": { borderColor: "#efd898" },
                  color: "#5c4314",
                },
                "& label": { color: "#7e6020" },
                "& .MuiFormHelperText-root": { color: "#b68c4c" },
              }}
              autoComplete="current-password"
            />
          </Fade>
          <Fade in={!isPending} timeout={800}>
            <TextField
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              {...register("newPassword", {
                required: "New password is required",
                minLength: { value: 6, message: "Minimum length is 6 characters" },
              })}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowNewPassword} edge="end" aria-label="toggle new password visibility">
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              disabled={isPending}
              sx={{
                color: "#5c4314",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#7e6020" },
                  "&:hover fieldset": { borderColor: "#efd898" },
                  color: "#5c4314",
                },
                "& label": { color: "#7e6020" },
                "& .MuiFormHelperText-root": { color: "#b68c4c" },
              }}
              autoComplete="new-password"
            />
          </Fade>
          <Box mt={5} position="relative" textAlign="center">
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: "#7e6020",
                color: "#fff",
                fontWeight: "bold",
                py: 1.5,
                fontSize: "1rem",
                "&:hover": { backgroundColor: "#efd898", color: "#7e6020" }
              }}
              disabled={isPending}
              startIcon={
                isPending ? <RotateLeftIcon sx={{ animation: "spin 1.5s linear infinite" }} /> : null
              }
            >
              {isPending ? "Updating..." : "Update Password"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default UpdatePassword;
