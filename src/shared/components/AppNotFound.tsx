import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, FileQuestion, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "#/components/ui/button";
import * as m from "#/paraglide/messages";
import { AppEmptyState } from "./AppEmptyState";

// The 404 state for a single by-id resource: "<Resource> not found", with a way
// out. Distinct from AppError — a missing (or cross-tenant, tenant-isolated)
// record, not a transient failure, so there is no retry. Pass `action` (e.g. a
// back-to-list link); otherwise it falls back to browser-history back, which
// covers every entry point (list, pasted URL, deep link).
export function AppNotFound({
	resource,
	icon = FileQuestion,
	description,
	action,
}: {
	resource: string;
	icon?: LucideIcon;
	description?: string;
	action?: ReactNode;
}) {
	const router = useRouter();
	return (
		<AppEmptyState
			icon={icon}
			title={m.not_found_resource({ resource })}
			description={description ?? m.resource_not_found()}
			action={
				action ?? (
					<Button variant="outline" onClick={() => router.history.back()}>
						<ArrowLeft className="size-4" />
						{m.go_back()}
					</Button>
				)
			}
		/>
	);
}
