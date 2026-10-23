import { AuthSuspense } from "@/components/auth/auth-suspense";
import LoginForm from "./login-form";

export default function LoginPage() {
    return (
        <AuthSuspense>
            <LoginForm />
        </AuthSuspense>
    );
}