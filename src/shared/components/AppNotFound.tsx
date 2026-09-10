import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, FileQuestion, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "#/components/ui/button";
import * as m from "#/paraglide/messages";
import { AppEmptyState } from "./AppEmptyState";

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
