import { AuthSuspense } from "@/components/auth/auth-suspense";
import VerifyEmailForm from "./verify-email-form";

export default function VerifyEmailPage() {
    return (
        <AuthSuspense>
            <VerifyEmailForm />
        </AuthSuspense>
    );
}