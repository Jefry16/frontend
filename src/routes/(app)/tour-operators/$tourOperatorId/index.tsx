import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MoonIcon, SunIcon } from "lucide-react";
import { useAuth } from "#/auth";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import * as m from "#/paraglide/messages";
import { useTheme } from "#/shared/theme";
import { useCurrentTourOperator } from "#/tour-operator";

export const Route = createFileRoute("/(app)/tour-operators/$tourOperatorId/")({
	component: TourOperatorHome,
});

// The operator home — the post-login landing. Placeholder until the dashboard +
// nav slices land; confirms the operator context resolves and hosts theme + sign
// out for now.
function TourOperatorHome() {
	const operator = useCurrentTourOperator();
	const { user, logout } = useAuth();
	const { theme, toggle } = useTheme();
	const navigate = useNavigate();

	const signOut = async () => {
		await logout();
		navigate({ to: "/auth/login" });
	};

	return (
		<div className="flex min-h-screen items-center justify-center p-6">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="flex items-center justify-between gap-2">
						<span>{operator?.name}</span>
						{operator && <Badge variant="secondary">{operator.role}</Badge>}
					</CardTitle>
					<CardDescription>
						{m.signed_in_as()} <strong>{user?.name}</strong>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						{m.operator_home_placeholder()}
					</p>
					<Separator />
					<div className="flex items-center justify-between">
						<Button variant="outline" onClick={toggle}>
							{theme === "dark" ? (
								<SunIcon className="size-4" />
							) : (
								<MoonIcon className="size-4" />
							)}
							{m.toggle_theme()}
						</Button>
						<Button variant="ghost" onClick={signOut}>
							{m.sign_out()}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
