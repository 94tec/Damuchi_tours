"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface GoogleButtonProps {
  label?: string;
  disabled?: boolean;
}

function GoogleIcon() {
  return (
    <svg
      className="h-[18px] w-[18px] shrink-0"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />

      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />

      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />

      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleButton({
  label = "Continue with Google",
  disabled = false,
}: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleSignIn() {
    if (isLoading || disabled) return;

    setIsLoading(true);

    try {
      /*
       * ============================================================
       * Google Identity Services integration
       * ============================================================
       *
       * Production flow:
       *
       * 1. Initialize Google Identity Services.
       * 2. Obtain the Google ID token.
       * 3. Send the ID token to your auth API:
       *
       *    const result = await authApi.googleLogin(idToken);
       *
       * 4. Store the returned authentication state.
       * 5. Redirect according to the authentication result.
       *
       * Example:
       *
       * const result = await authApi.googleLogin(idToken);
       *
       * if (result.tempToken) {
       *   setTempToken(result.tempToken);
       *   router.push("/login/verify");
       *   return;
       * }
       *
       * if (result.tokens) {
       *   setTokens(result.tokens);
       *   if (result.user) setUser(result.user);
       *   router.push("/dashboard");
       * }
       */

      toast.info(
        "Google sign-in is not configured yet. Please use email and password."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const isDisabled = disabled || isLoading;

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      disabled={isDisabled}
      loading={isLoading}
      onClick={() => void handleGoogleSignIn()}
      aria-label={label}
      className="
        relative
        h-12
        w-full
        gap-3
        rounded-xl
        border-white/[0.08]
        bg-white/[0.025]
        text-sm
        font-medium
        text-white/80
        shadow-none
        transition-all
        duration-200
        hover:border-white/[0.14]
        hover:bg-white/[0.05]
        hover:text-white
        active:scale-[0.99]
        disabled:cursor-not-allowed
        disabled:opacity-40
      "
    >
      {isLoading ? (
        <Loader2 className="h-[18px] w-[18px] animate-spin" />
      ) : (
        <GoogleIcon />
      )}

      <span>{isLoading ? "Connecting to Google…" : label}</span>
    </Button>
  );
}
