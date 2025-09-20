import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {  Button,  Paper,  TextField,  Typography,  Box,  Fade,  IconButton,} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { keyframes } from "@emotion/react";
import { useResetPassword } from "@/customHooks/query/auth.query";
import { ResetPasswordRequest } from "@/typescript/auth.typescript";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const { token } = router.query; // expects ?token=... in URL

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ password: string }>({ shouldFocusError: false });

  const { mutate, isPending } = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const onSubmit: SubmitHandler<{ password: string }> = (data) => {
    if (typeof token !== "string") {
      toast.error("Invalid or missing token. Please use a valid reset link.");
      return;
    }
    mutate(
      { token, password: data.password },
      {
        onSuccess: (res) => {
          if (res?.status) {
            reset();
          } 
        },
      }
    );
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        backgroundColor: "#fff",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: 6,
          width: { xs: 320, sm: 400 },
          borderRadius: 3,
          background: "rgba(255, 255, 255, 0.25)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          animation: `${fadeIn} 1s ease-out`,
        }}
      >
        <Box textAlign="center" mb={2}>
          <Typography variant="h4" sx={{ color: "#7e6020", fontWeight: "bold" }}>
            Reset Password
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Fade in={!isPending} timeout={800}>
            <Box sx={{ position: "relative", width: "100%" }}>
              <TextField
                {...register("password", {
                  required: "New password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
                label="New Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    color: "#5c4314",
                    "& fieldset": {
                      borderColor: "#7e6020",
                    },
                    "&:hover fieldset": {
                      borderColor: "#efd898",
                    },
                  },
                  "& .MuiFormHelperText-root": {
                    color: "#b68d4c",
                  },
                  "& label": {
                    color: "#7e6020",
                  },
                }}
                disabled={isPending}
                autoComplete="new-password"
              />
              <IconButton
                onClick={togglePasswordVisibility}
                sx={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#7e6020",
                }}
                disabled={isPending}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Box>
          </Fade>

          <Box mt={3} position="relative" textAlign="center">
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                margin: "20px 0",
                background: "#7e6020",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": { background: "#efd898", color: "#7e6020" },
                py: 1.5,
                fontSize: "1rem",
              }}
              disabled={isPending}
              startIcon={
                isPending ? (
                  <RotateLeftIcon sx={{ animation: `spin 1s linear infinite` }} />
                ) : null
              }
            >
              {isPending ? "Loading..." : "Reset Password"}
            </Button>
          </Box>
          <Button
            variant="text"
            fullWidth
            sx={{
              color: "#7e6020",
              fontWeight: "bold",
              textTransform: "none",
              mt: 2,
              fontSize: "1rem",
            }}
            onClick={() => router.push("/user/login")}
            disabled={isPending}
          >
            Back to Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
