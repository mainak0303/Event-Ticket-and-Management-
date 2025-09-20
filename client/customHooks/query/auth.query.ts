import { ForgotPasswordRequest, ForgotPasswordResponse, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordRequest, ResetPasswordResponse, UpdatePasswordRequest, UpdatePasswordResponse, UserProfile, UserProfileResponse, VerifyEmailRequest, VerifyEmailResponse } from "@/typescript/auth.typescript";
import { useUserStore } from "@/utils/store/store";
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useGlobalHooks } from "../globalHooks/globalHooks";
import { fetchUserProfile, forgotPasswordFn, loginFn, registerFn, resetPasswordFn, updatePasswordFn, verifyEmailFn } from "@/api/functions/auth.api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

//login
export const useLogin = (): UseMutationResult<LoginResponse, unknown, LoginRequest> =>
{
    const setUser = useUserStore( ( state ) => state.setUser );
    const setToken = useUserStore( ( state ) => state.setToken );
    const { queryClient } = useGlobalHooks();
    const router = useRouter();

    return useMutation<LoginResponse, unknown, LoginRequest>( {
        mutationFn: loginFn,
        onSuccess: ( res ) =>
        {
            const { status, message, token, data: user } = res || {};
            if ( status && token && user )
            {
                setToken( token, true );
                setUser( { id: user.id, name: user.name,email:user.email, image: "" } );
                toast.success( message || "Login successful! Welcome back." );
                queryClient.invalidateQueries( { queryKey: [ "USER" ] } );
                router.push( "/" );
            } else
            {
                toast.error( message || "Login failed." );
            }
        },
        onError: () =>
        {
            toast.error( "Login failed. Please check your credentials." );
        },
    } );
};

//register
export const useRegister = (): UseMutationResult<RegisterResponse, unknown, RegisterRequest> =>
{

    const { queryClient } = useGlobalHooks();
    const router = useRouter();
    return useMutation<RegisterResponse, unknown, RegisterRequest>( {
        mutationFn: registerFn,
        onSuccess: ( res ) =>
        {
            const { status, message, data } = res || {};

            if ( status && data )
            {
                toast.success( message || "Registration successful. Please verify your email." );
                queryClient.invalidateQueries( { queryKey: [ "USER" ] } );
                router.push( "/user/login" );
            } else
            {
                toast.error( message || "Registration failed." );
            }
        },
        onError: () =>
        {
            toast.error( "Registration failed. Please check your input." );
        },
    } );
};
//verify email
export const useVerifyEmail = (): UseMutationResult<VerifyEmailResponse, unknown, VerifyEmailRequest> =>
{
    const { queryClient } = useGlobalHooks();

    return useMutation<VerifyEmailResponse, unknown, VerifyEmailRequest>( {
        mutationFn: verifyEmailFn,
        onSuccess: ( message ) =>
        {
            toast.success( message || "Email verified successfully. You can now log in." );
            queryClient.invalidateQueries( { queryKey: [ "USER" ] } );
        },
        onError: () =>
        {
            toast.error( "Failed to verify email. Please try again." );
        },
    } );
};
//user profile
export const useUserProfile = () =>
{
    const setUser = useUserStore( ( state ) => state.setUser );
    const { queryClient } = useGlobalHooks();

    return useQuery<UserProfileResponse, Error>( {
        queryKey: [ "USER_PROFILE" ],
        queryFn: fetchUserProfile,
        onSuccess: ( res: any ) =>
        {
            if ( res && res.user )
            {
                const userData: UserProfile = res.user;
                setUser( {
                    id: userData._id,
                    name: userData.name,
                    email: userData.email,
                    image: "",
                } );
            } else
            {
                toast.error( "Failed to load user profile." );
            }
        },
        onError: () =>
        {
            toast.error( "Error fetching user profile. Please try again." );
        },
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        cacheTime: 10 * 60 * 1000,
    } );
};
// forgot password
export const useForgotPassword = (): UseMutationResult<ForgotPasswordResponse, unknown, ForgotPasswordRequest> =>
{
    const { queryClient } = useGlobalHooks();

    return useMutation<ForgotPasswordResponse, unknown, ForgotPasswordRequest>( {
        mutationFn: forgotPasswordFn,
        onSuccess: ( res ) =>
        {
            const { status, message } = res || {};

            if ( status )
            {
                toast.success( message || "Password reset link sent to your email." );
            } else
            {
                toast.error( message || "Failed to send password reset link." );
            }
            queryClient.invalidateQueries( { queryKey: [ "USER" ] } );
        },
        onError: () =>
        {
            toast.error( "Failed to send password reset link. Please try again." );
        },
    } );
};
// reset password
export const useResetPassword = (): UseMutationResult<ResetPasswordResponse, unknown, ResetPasswordRequest> =>
{
    const { queryClient } = useGlobalHooks();
    const router = useRouter()

    return useMutation<ResetPasswordResponse, unknown, ResetPasswordRequest>( {
        mutationFn: resetPasswordFn,
        onSuccess: ( res ) =>
        {
            const { status, message } = res || {};

            if ( status )
            {
                toast.success( message || "Password reset successful. You may now log in." );
                router.push( "/user/login" );
            } else
            {
                toast.error( message || "Failed to reset password." );
            }

            queryClient.invalidateQueries( { queryKey: [ "USER" ] } );
        },
        onError: () =>
        {
            toast.error( "Failed to reset password. Please try again." );
        },
    } );
};
// update password 
export const useUpdatePassword = (): UseMutationResult<UpdatePasswordResponse, unknown, UpdatePasswordRequest> =>
{
    const { queryClient } = useGlobalHooks();
    const router = useRouter()
    return useMutation<UpdatePasswordResponse, unknown, UpdatePasswordRequest>( {
        mutationFn: updatePasswordFn,
        onSuccess: ( res ) =>
        {
            const { status, message } = res || {};

            if ( status )
            {
                toast.success( message || "Password updated successfully." );
                router.push("/");
            } else
            {
                toast.error( message || "Failed to update password." );
            }

            queryClient.invalidateQueries( { queryKey: [ "USER" ] } );
        },
        onError: () =>
        {
            toast.error( "Failed to update password. Please try again." );
        },
    } );
};