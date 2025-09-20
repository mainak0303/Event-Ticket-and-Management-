import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button, Paper, TextField, Typography, Box, IconButton, Fade, CircularProgress, } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { keyframes } from "@emotion/react";
import { useRegister } from "@/customHooks/query/auth.query"; // Your custom hook path
import { RegisterRequest } from "@/typescript/auth.typescript";
import NextLink from "next/link";
import { Link as MuiLink } from "@mui/material";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Register: React.FC = () =>
{
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterRequest>( { shouldFocusError: false } );

  const router = useRouter();
  const { mutate, isPending } = useRegister();
  const [ showPassword, setShowPassword ] = useState( false );

  const togglePasswordVisibility = () => setShowPassword( ( prev ) => !prev );

  const onSubmit: SubmitHandler<RegisterRequest> = ( data ) =>
  {
    mutate( data, {
      onSuccess: ( res ) =>
      {
        if ( res?.status && res?.data )
        {
          reset();
          router.push( "/user/login" ); // navigate to login after registration
        } else
        {

        }
      },
      onError: () =>
      {

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
            Register
          </Typography>
        </Box>

        <form onSubmit={ handleSubmit( onSubmit ) }>
          <Fade in={ !isPending } timeout={ 600 }>
            <TextField
              { ...register( "name", {
                required: "Name is required",
                minLength: { value: 2, message: "Minimum 2 characters" },
              } ) }
              label="Name"
              placeholder="Your name"
              fullWidth
              margin="normal"
              error={ !!errors.name }
              helperText={ errors.name?.message }
              sx={ {
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  color: "#5c4314",
                  "& fieldset": { borderColor: "#7e6020" },
                  "&:hover fieldset": { borderColor: "#efd898" },
                },
                "& .MuiFormHelperText-root": { color: "#b68d4c" },
                "& label": { color: "#7e6020" },
              } }
              disabled={ isPending }
            />
          </Fade>
          <Fade in={ !isPending } timeout={ 700 }>
            <TextField
              { ...register( "email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: "Invalid email format",
                },
              } ) }
              label="Email"
              placeholder="Enter your email"
              fullWidth
              margin="normal"
              error={ !!errors.email }
              helperText={ errors.email?.message }
              sx={ {
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  color: "#5c4314",
                  "& fieldset": { borderColor: "#7e6020" },
                  "&:hover fieldset": { borderColor: "#efd898" },
                },
                "& .MuiFormHelperText-root": { color: "#b68d4c" },
                "& label": { color: "#7e6020" },
              } }
              disabled={ isPending }
              autoComplete="email"
            />
          </Fade>

          <Fade in={ !isPending } timeout={ 800 }>
            <Box sx={ { position: "relative", width: "100%" } }>
              <TextField
                { ...register( "password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                } ) }
                label="Password"
                type={ showPassword ? "text" : "password" }
                fullWidth
                margin="normal"
                error={ !!errors.password }
                helperText={ errors.password?.message }
                sx={ {
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    color: "#5c4314",
                    "& fieldset": { borderColor: "#7e6020" },
                    "&:hover fieldset": { borderColor: "#efd898" },
                  },
                  "& .MuiFormHelperText-root": { color: "#b68d4c" },
                  "& label": { color: "#7e6020" },
                } }
                disabled={ isPending }
                autoComplete="new-password"
              />
              <IconButton
                onClick={ togglePasswordVisibility }
                sx={ {
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#7e6020",
                } }
                disabled={ isPending }
                aria-label={ showPassword ? "Hide password" : "Show password" }
              >
                { showPassword ? <VisibilityOff /> : <Visibility /> }
              </IconButton>
            </Box>
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
              { isPending ? "Loading..." : "Register" }
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
            Already have an account? Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;
