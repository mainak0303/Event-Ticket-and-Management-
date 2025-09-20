import { ForgotPasswordRequest, ForgotPasswordResponse, LoginRequest, LoginResponse, RegisterRequest, 
RegisterResponse, ResetPasswordRequest, ResetPasswordResponse, UpdatePasswordRequest, UpdatePasswordResponse, 
UserProfileResponse, VerifyEmailRequest, VerifyEmailResponse } from "@/typescript/auth.typescript";
import { MutationFunction } from "@tanstack/react-query";
import { endPoints } from "../endPoints/endPoints";
import axiosInstance from "../axios/axios";

//login
export const loginFn: MutationFunction<LoginResponse, LoginRequest> = async ( payload: LoginRequest ) =>
{
    const { data } = await axiosInstance.post<LoginResponse>( endPoints.auth.login, payload );
    return data;
};
//register
export const registerFn: MutationFunction<RegisterResponse, RegisterRequest> = async ( payload ) =>
{
    const { data } = await axiosInstance.post<RegisterResponse>( endPoints.auth.register, payload );
    return data;
};
//verify email
export const verifyEmailFn: MutationFunction<VerifyEmailResponse, VerifyEmailRequest> = async ( payload ) =>
{
    const { data } = await axiosInstance.get<string>( endPoints.auth.verify, { params: { token: payload.token },} );
    return data;
};
//user profile
export async function fetchUserProfile (): Promise<UserProfileResponse>
{
    const { data } = await axiosInstance.get<UserProfileResponse>( endPoints.auth.profile );
    return data;
}
//forgot password
export const forgotPasswordFn: MutationFunction<ForgotPasswordResponse, ForgotPasswordRequest> = async ( payload ) =>
{
    const { data } = await axiosInstance.post<ForgotPasswordResponse>( endPoints.auth.forgotpw, payload );
    return data;
};
//reset password
export const resetPasswordFn: MutationFunction<ResetPasswordResponse, ResetPasswordRequest> = async ( payload ) =>
{
    const { data } = await axiosInstance.post<ResetPasswordResponse>( `${ endPoints.auth.resetpw }?token=${ payload.token }`, payload );
    return data;
};
//update password
export const updatePasswordFn: MutationFunction<UpdatePasswordResponse, UpdatePasswordRequest> = async (payload) => {
  const { data } = await axiosInstance.post<UpdatePasswordResponse>(endPoints.auth.updatepw, payload);
  return data;
};
