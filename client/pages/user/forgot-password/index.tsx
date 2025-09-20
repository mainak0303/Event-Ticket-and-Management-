import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button, Paper, TextField, Typography, Box, Fade, } from "@mui/material";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { keyframes } from "@emotion/react";
import { useForgotPassword } from "@/customHooks/query/auth.query";
import { ForgotPasswordRequest } from "@/typescript/auth.typescript";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ForgotPassword: React.FC = () =>
{
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>( { shouldFocusError: false } );

  const router = useRouter();
  const { mutate, isPending } = useForgotPassword();

  const onSubmit: SubmitHandler<ForgotPasswordRequest> = ( data ) =>
  {
    mutate( data, {
      onSuccess: ( res ) =>
      {
        if ( res?.status )
        {
          reset();
        }
      },
    } );
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={ {
        backgroundColor: "#fff",
      } }
    >
      <Paper
        elevation={ 10 }
        sx={ {
          padding: 6,
          width: { xs: 320, sm: 400 },
          borderRadius: 3,
          background: "rgba(255, 255, 255, 0.25)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          animation: `${ fadeIn } 1s ease-out`,
        } }
      >
        <Box textAlign="center" mb={ 2 }>
          <Typography variant="h4" sx={ { color: "#7e6020", fontWeight: "bold" } }>
            Forgot Password
          </Typography>
        </Box>

        <form onSubmit={ handleSubmit( onSubmit ) }>
          <Fade in={ !isPending } timeout={ 600 }>
            <TextField
              { ...register( "email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/i,
                  message: "Invalid email address",
                },
              } ) }
              label="Email"
              placeholder="Enter your registered email"
              fullWidth
              margin="normal"
              error={ !!errors.email }
              helperText={ errors.email?.message }
              sx={ {
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
              } }
              disabled={ isPending }
              autoComplete="email"
            />
          </Fade>

          <Box mt={ 3 } position="relative" textAlign="center">
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={ {
                margin: "20px 0",
                background: "#7e6020",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": { background: "#efd898", color: "#7e6020" },
                py: 1.5,
                fontSize: "1rem",
              } }
              disabled={ isPending }
              startIcon={
                isPending ? (
                  <RotateLeftIcon sx={ { animation: `spin 1s linear infinite` } } />
                ) : null
              }
            >
              { isPending ? "Loading..." : "Send Reset Link" }
            </Button>
          </Box>

          <Button
            variant="text"
            fullWidth
            sx={ {
              color: "#7e6020",
              fontWeight: "bold",
              textTransform: "none",
              mt: 2,
              fontSize: "1rem",
            } }
            onClick={ () => router.push( "/user/login" ) }
            disabled={ isPending }
          >
            Remembered password? Back to Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
