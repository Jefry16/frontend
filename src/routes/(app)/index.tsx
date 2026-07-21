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

export const Route = createFileRoute("/(app)/")({
	component: Home,
});

// Placeholder authenticated landing until the tour-operator feature ships an
// operator-aware home. Confirms the session works end to end: greets the user,
// lists their operators + role, and offers theme toggle + sign out.
function Home() {
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
					<CardTitle>Vointika Admin</CardTitle>
					<CardDescription>
						{m.signed_in_as()} <strong>{user?.name}</strong>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<p className="text-sm font-medium">{m.your_operators()}</p>
						{user && user.tourOperators.length > 0 ? (
							<ul className="space-y-1">
								{user.tourOperators.map((op) => (
									<li
										key={op.id}
										className="flex items-center justify-between text-sm"
									>
										<span>{op.name}</span>
										<Badge variant="secondary">{op.role}</Badge>
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-muted-foreground">
								{m.no_operators()}
							</p>
						)}
					</div>
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
