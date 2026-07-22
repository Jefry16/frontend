import { createFileRoute } from "@tanstack/react-router";
import { AppTourOperatorForm } from "#/tour-operator";

export const Route = createFileRoute("/(app)/tour-operators/new")({
	component: NewTourOperatorPage,
});

function NewTourOperatorPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-6">
			<AppTourOperatorForm />
		</div>
	);
}
