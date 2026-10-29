type ErrorBody = {
  message?: string;
  errorCode?: string;
  errors?: Record<string, string>;
};

type LoginError = ErrorBody & {
  status?: number;
  code?: string;
  data?: ErrorBody;
};

const CODE_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Incorrect email or password.",
  ACCOUNT_LOCKED: "Your account is temporarily locked after too many attempts. Try again later or reset your password.",
  EMAIL_NOT_VERIFIED: "Please verify your email address before signing in.",
  ACCOUNT_DISABLED: "This account has been disabled. Please contact support.",
  PASSWORD_EXPIRED: "Your password has expired. Please reset it to continue.",
};

export const GENERIC_LOGIN_ERROR =
  "We couldn't sign you in. Check your email and password and try again.";

export function getLoginErrorMessage(err: unknown): string {
  const e = (err ?? {}) as LoginError;
  const body: ErrorBody = e.data ?? e;
  const status = e.status;
  const code = body.errorCode ?? e.code;

  if (status === 0 || status === undefined) {
    return "We can't reach the server right now. Check your internet connection and try again.";
  }

  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code];

  if (body.errors && Object.keys(body.errors).length > 0) {
    return Object.values(body.errors).join(" ");
  }

  if (status === 429) return "Too many attempts. Please wait a few minutes and try again.";
  if (status >= 500) return "Something went wrong on our side. Please try again in a moment.";

  if (body.message && body.message !== "Not Authenticated") return body.message;

  return GENERIC_LOGIN_ERROR;
}
