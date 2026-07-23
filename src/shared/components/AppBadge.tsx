import type { ComponentProps } from "react";
import { Badge } from "#/components/ui/badge";

// The app's badge. A thin wrapper over the shadcn Badge so feature code depends
// on one App-level component — a single seam to evolve badge defaults or add
// semantic tones later, without touching every call site. Same API as the
// underlying Badge (variant / asChild / className / children).
export type AppBadgeProps = ComponentProps<typeof Badge>;

export const AppBadge = (props: AppBadgeProps) => <Badge {...props} />;
