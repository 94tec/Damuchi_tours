import { apiClient } from "@/lib/api-client";
import type {
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    OtpResult,
    OtpVerificationResult,
    PasswordChangeRequest,
    RegisterRequest,
    RegistrationResponse,
    ResetPasswordRequest,
    TokenPair, User,
    UserProfile,
    UserUpdateRequest,
    VerifyLoginOtpRequest,
    VerifyOtpRequest,
} from "@/types/auth";

// ─────────────────────────────────────────────────────────────────
// ApiResponse wrapper — your backend wraps every response in:
// { success: boolean, message: string, data: T, timestamp: string }
// We unwrap it here so callers always get T directly.
// ─────────────────────────────────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  error?: string;
}
// ───────────────────────────────────────────────────────────── // Normalized API error // ─────────────────────────────────────────────────────────────
export class AuthApiError extends Error {
    status: number;
    code?: string;
    timestamp?: string;
    constructor(
        message: string,
        status = 400,
        code?: string,
        timestamp?: string
    ) {
        super(message);
        this.name = "AuthApiError";
        this.status = status;
        this.code = code;
        this.timestamp = timestamp;
        Object.setPrototypeOf(this, AuthApiError.prototype);
    }
}

// ────────────────────── // Response unwrapping // ────────────────────────────
async function unwrap<T>(
    promise: Promise<{ data: ApiResponse<T> }>
): Promise<T> {
    const response = await promise;
    const wrapper = response.data;
    if (!wrapper) {
        throw new AuthApiError(
            "The server returned an empty response.",
            502
        );
    }
    if (!wrapper.success) {
        throw new AuthApiError(
            wrapper.message || wrapper.error || "Request failed.",
            400,
            wrapper.error,
            wrapper.timestamp
        );
    }
    return wrapper.data;
}
// ───────────────────// Authentication API // ─────────────────────────────

export const authApi = {
  // ── AuthController ──────────────────────────────────────────────
  // ============================================================
  // REGISTRATION
  // ============================================================
  register: async (p: RegisterRequest): Promise<RegistrationResponse> =>
      unwrap<RegistrationResponse>(
          apiClient.post("/auth/register", p)
      ),

  // ============================================================
  // LOGIN
  // ============================================================
  login: async (p: LoginRequest): Promise<LoginResponse> =>
      unwrap<LoginResponse>(
          apiClient.post("/auth/login", p)
      ),
  // ============================================================
  // LOGOUT
  // ============================================================
  logout: async (): Promise<void> => {
      await unwrap<void>(
          apiClient.post("/auth/logout")
      );
  },

  // ============================================================
  // TOKEN
  // ============================================================
  refreshToken: async (
      refreshToken: string
  ): Promise<TokenPair> =>
      unwrap<TokenPair>(
          apiClient.post(
              "/auth/refresh", {
                  refreshToken,
              }
          )
      ),

  // ============================================================
  // CURRENT USER
  // ============================================================
  getCurrentUser: async (): Promise<User> =>
      unwrap<User>(
          apiClient.get("/auth/me")
      ),

  // ── GoogleAuthController ────────────────────────────────────────
  // ============================================================
  // GOOGLE AUTHENTICATION
  // ============================================================
  googleLogin: async (idToken: string): Promise<LoginResponse> =>
      unwrap<LoginResponse>(
          apiClient.post(
              "/auth/google/login", {
                  idToken }
          )
      ),
  // ============================================================
  // EMAIL VERIFICATION
  // ============================================================
  verifyEmail: async (token: string): Promise<{ message: string }> =>
      unwrap<{ message: string }>(
          apiClient.get("/auth/verify-email", {
              params: { token },
          })
      ),
  resendVerification: async (
      email: string
  ): Promise<{ message: string }> =>
      unwrap<{ message: string }>(
          apiClient.post(
          "/auth/resend-verification", {
              email,
              }
          )
      ),
  // ── FirstTimeSetupController ────────────────────────────────────
  // Your backend endpoint uses Authorization header with the temp Bearer token
  // Request body: only newPassword (confirmPassword is frontend-only validation)
  // ============================================================
  // FIRST-TIME PASSWORD SETUP
  // ============================================================
  // Step 1: POST /api/auth/first-time-setup/change-password
  changePasswordFirstTime: async (
      tempToken: string,
      p: ChangePasswordRequest
  ): Promise<OtpResult> =>
      unwrap<OtpResult>(
          apiClient.post(
              "/auth/first-time-setup/change-password",
              p, {
                  headers: {
                      Authorization: `Bearer ${tempToken}`,
                  },
              }
          )
      ),

  // Step 2: POST /api/auth/first-time-setup/verify-otp
  verifyOtpFirstTime: async (
      tempToken: string,
      p: VerifyOtpRequest
  ): Promise<OtpVerificationResult> =>
      unwrap<OtpVerificationResult>(
          apiClient.post(
              "/auth/first-time-setup/verify-otp",
              p, {
                  headers: {
                      Authorization: `Bearer ${tempToken}`
                  },
              }
          )
      ),

  // POST /api/auth/first-time-setup/resend-otp
  resendSetupOtp: async (tempToken: string): Promise<OtpResult> =>
      unwrap<OtpResult>(
          apiClient.post(
              "/auth/first-time-setup/resend-otp",
              {}, {
                  headers: {
                      Authorization: `Bearer ${tempToken}`
                  },
              }
          )
      ),
  // Step 3: POST /api/auth/first-time-setup/complete
  completeSetup: async (verificationToken: string): Promise<TokenPair> =>
      unwrap<TokenPair>(
          apiClient.post("/auth/first-time-setup/complete", { verificationToken })
      ),

  // ── OtpController (login 2FA) ───────────────────────────────────
  // ============================================================
  // LOGIN 2FA / OTP
  // ============================================================
  verifyLoginOtp: async (
      tempToken: string,
      p: VerifyLoginOtpRequest
  ): Promise<TokenPair> =>
      unwrap<TokenPair>(
          apiClient.post(
              "/auth/login-otp/verify",
              p, {
                  headers: { "X-Temp-Token": tempToken },
          })
      ),

  resendLoginOtp: async (tempToken: string): Promise<OtpResult> =>
      unwrap<OtpResult>(
          apiClient.post(
              "/auth/login-otp/resend",
              {},
              { headers: { "X-Temp-Token": tempToken } }
          )
      ),

  // ── PasswordResetController ─────────────────────────────────────
  // ============================================================
  // PASSWORD RESET
  // ============================================================
  forgotPassword: async (
      p: ForgotPasswordRequest
  ): Promise<{ message: string }> =>
      unwrap<{ message: string }>(
          apiClient.post(
              "/password-reset/initiate",
              p
          )
      ),

  resetPassword: async (
      p: ResetPasswordRequest
  ): Promise<{ message: string }> =>
      unwrap<{ message: string }>(
          apiClient.post(
              "/password-reset/complete",
              p
          )
      ),
  validateResetToken: async (
      token: string
  ): Promise<{ valid: boolean; message: string }> =>
      unwrap<{ valid: boolean; message: string }>(
          apiClient.post("/password-reset/validate-token", { token })
      ),
  // ── PasswordManagementController ────────────────────────────
  // ============================================================
  // PASSWORD MANAGEMENT
  // ============================================================
  changePassword: async (
      p: PasswordChangeRequest
  ): Promise<{ message: string }> =>
      unwrap<{ message: string }>(
          apiClient.post(
              "/password/change",
              p
          )
      ),

  // ── UserProfileController ───────────────────────────────────
  // ============================================================
  // USER PROFILE
  // ============================================================
  getProfile: async (): Promise<UserProfile> =>
      unwrap<UserProfile>(
          apiClient.get("/user/profile")
      ),

  updateProfile: async (
      p: UserUpdateRequest
  ): Promise<UserProfile> =>
      unwrap<UserProfile>(
          apiClient.put(
              "/user/profile",
              p
          )
      ),

};