import React, { useEffect } from "react";
import {  Button,  Paper,  Typography,  Box,  Fade,  CircularProgress,} from "@mui/material";
import { keyframes } from "@emotion/react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useVerifyEmail } from "@/customHooks/query/auth.query";
import { VerifyEmailRequest } from "@/typescript/auth.typescript";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const VerifyEmail: React.FC = () => {
  const router = useRouter();
  const { token } = router.query;
  const { mutate, isPending, data } = useVerifyEmail();

  useEffect(() => {
    if (typeof token === "string") {
      mutate({ token });
    }
  }, [token, mutate]);

  const handleGoToLogin = () => {
    router.push("/user/login");
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
            Email Verification
          </Typography>
        </Box>
        <Fade in={isPending} timeout={600}>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={100}>
            {isPending && <CircularProgress color="inherit" sx={{ color: "#7e6020", mb: 3 }} />}
            <Typography variant="body1" sx={{ color: "#5c4314", fontWeight: 500 }}>
              Verifying your email...
            </Typography>
          </Box>
        </Fade>
        {!isPending && (
          <Box textAlign="center" mt={2}>
            <Typography
              variant="subtitle1"
              sx={{
                color: data?.includes("successfully") ? "#228B22" : "#B22222",
                fontWeight: "bold",
                mb: 3,
                minHeight: "32px",
              }}
            >
              {data ||
                "Verification failed or token missing. Please try again or check your link."}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{
                background: "#7e6020",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": { background: "#efd898", color: "#7e6020" },
                py: 1.2,
                fontSize: "1rem",
                mt: 2,
              }}
              onClick={handleGoToLogin}
            >
              Go to Login
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default VerifyEmail;
