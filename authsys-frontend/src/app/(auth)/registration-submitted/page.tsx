import { AuthSuspense } from "@/components/auth/auth-suspense";
import RegistrationSubmittedForm from "./registration-submitted-form";

export default function RegistrationSubmittedPage() {
    return (
        <AuthSuspense>
            <RegistrationSubmittedForm />
        </AuthSuspense>
    );
}