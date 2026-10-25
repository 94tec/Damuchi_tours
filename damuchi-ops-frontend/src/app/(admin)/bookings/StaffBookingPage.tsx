import { AuthSuspense } from "@/components/auth/auth-suspense";
import StaffBookings from "./StaffBookings";

export default function StaffBookingsPage() {
    return (
        <AuthSuspense>
            <StaffBookings />
        </AuthSuspense>
    );
}