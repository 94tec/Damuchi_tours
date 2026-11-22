type ErrorBody = {
  message?: string;
  error?: string;
  errorCode?: string;
  traceId?: string;
  errors?: Record<string, string> | string[];
};

type LoginError = ErrorBody & {
  status?: number;
  code?: string;
  data?: ErrorBody;
  // raw axios shape, in case the interceptor doesn't normalize
  response?: { status?: number; data?: ErrorBody };
  message?: string;
};

// Fallbacks, used only when the backend sends no message of its own.
const CODE_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Incorrect email or password.",
  ACCOUNT_LOCKED: "Your account is temporarily locked after too many attempts. Try again later or reset your password.",
  EMAIL_NOT_VERIFIED: "Please verify your email address before signing in.",
  ACCOUNT_DISABLED: "This account has been disabled. Please contact support.",
  PASSWORD_EXPIRED: "Your password has expired. Please reset it to continue.",
};

export const GENERIC_LOGIN_ERROR =
    "We couldn't sign you in. Check your email and password and try again.";

// Messages that say nothing useful, so skip them in favour of a fallback.
const USELESS = new Set(["not authenticated", "unauthorized", "forbidden", "error", "bad request"]);

const clean = (s?: string) => {
  const t = s?.trim();
  return t && !USELESS.has(t.toLowerCase()) ? t : undefined;
};

export function getLoginErrorMessage(err: unknown): string {
  const e = (err ?? {}) as LoginError;
  const body: ErrorBody = e.data ?? e.response?.data ?? e;
  const status = e.status ?? e.response?.status;
  const code = body.errorCode ?? e.code;

  // 1. Never reached the server.
  if (status === undefined || status === 0) {
    return "We can't reach the server right now. Check your connection and try again.";
  }

  // 2. Server crashed. Backend text may leak internals, so keep it generic but traceable.
  if (status >= 500) {
    const ref = body.traceId ? ` (ref: ${body.traceId})` : "";
    return `Something went wrong on our side. Please try again in a moment.${ref}`;
  }

  // 3. Field-level validation errors from the backend.
  if (body.errors) {
    const list = Array.isArray(body.errors) ? body.errors : Object.values(body.errors);
    if (list.length) return list.join(" ");
  }

  // 4. The backend's own message, exactly as sent.
  const backendMessage = clean(body.message) ?? clean(body.error);
  if (backendMessage) return backendMessage;

  // 5. Known error code, when no message came with it.
  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code];

  // 6. Status-based fallbacks.
  if (status === 429) return "Too many attempts. Please wait a few minutes and try again.";
  if (status === 401) return "Incorrect email or password.";
  if (status === 403) return "You don't have permission to sign in here.";

  return GENERIC_LOGIN_ERROR;
}