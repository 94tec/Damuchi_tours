import { AuthSuspense } from "@/components/auth/auth-suspense";
import ResetPasswordForm from "./reset-password-form"

export default function ResetPasswordPage() {
    return (
        <AuthSuspense>
            <ResetPasswordForm />
        </AuthSuspense>
    );
}