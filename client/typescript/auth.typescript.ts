// login
// Interface for login request body
export interface LoginRequest {
  email: string;
  password: string;
  captchaToken?: string;
}

// Interface for user data in the login response
export interface UserData {
  id: string;
  role: string;
  name: string;
  email: string;
}

// Interface for the entire login API response
export interface LoginResponse {
  status: boolean;
  message: string;
  data: UserData;
  token: string;
}

// register
// Interface for register request body
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Interface for user data in the register response
export interface RegisterUserData {
  name: string;
  email: string;
  password: string;  // hashed password
  role: string;
  emailVerified: boolean;
  verificationToken: string;
  _id: string;
  createdAt: string;  // ISO date string
  __v: number;
}

// Interface for the entire registration API response
export interface RegisterResponse {
  status: boolean;
  message: string;
  data: RegisterUserData;
}

//verify email
// Interface for verify email request query parameters
export interface VerifyEmailRequest {
  token: string;
}

// Since the response is a plain text message, you can type the response as string
export type VerifyEmailResponse = string; 

//Profile
// User object returned by the API
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string; // ISO date string
  __v: number;
}

// Response format of the user profile API
export interface UserProfileResponse {
  user: UserProfile;
}

// forgot password
// Interface for forgot password request body
export interface ForgotPasswordRequest {
  email: string;
}

// Interface for forgot password API response
export interface ForgotPasswordResponse {
  status: boolean;
  message: string;
}

// reset password
// Interface for reset password request body
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// Interface for reset password API response
export interface ResetPasswordResponse {
  status: boolean;
  message: string;
}

// update password
// Interface for update password request body
export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// Interface for update password API response
export interface UpdatePasswordResponse {
  status: boolean;
  message: string;
}

