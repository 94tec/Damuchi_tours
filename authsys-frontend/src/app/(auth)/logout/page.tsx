import { AuthSuspense } from "@/components/auth/auth-suspense";
import LogoutForm from "./logout-form";

export default function LogoutPage() {
    return (
        <AuthSuspense>
            <LogoutForm />
        </AuthSuspense>
    );
}