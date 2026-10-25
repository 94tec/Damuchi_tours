import { Badge } from "@/components/ui/badge";
import type { TourAdmin } from "@/types/tour";

interface TourStatusBadgeProps {
    tour: Pick<TourAdmin, "active" | "deleted">;
}

export function TourStatusBadge({ tour }: TourStatusBadgeProps) {
    if (tour.deleted) return <Badge variant="red">Deleted</Badge>;
    if (!tour.active) return <Badge variant="neutral">Inactive</Badge>;
    return <Badge variant="savanna">Active</Badge>;
}