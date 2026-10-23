import { AuthSuspense } from "@/components/auth/auth-suspense";
import PasswordResetForm from "./password-reset-form"

export default function PasswordResetPage() {
    return (
        <AuthSuspense>
            <PasswordResetForm />
        </AuthSuspense>
    );
}