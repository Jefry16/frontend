import { createFileRoute } from "@tanstack/react-router";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { useTheme } from "#/shared/theme";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const { theme, toggle } = useTheme();

	return (
		<div className="flex min-h-screen items-center justify-center p-6">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Vointika Admin</CardTitle>
					<CardDescription>
						Greenfield rebuild — the foundation is in place. Feature modules are
						built one at a time, starting with auth.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button variant="outline" onClick={toggle}>
						{theme === "dark" ? (
							<SunIcon className="size-4" />
						) : (
							<MoonIcon className="size-4" />
						)}
						Toggle theme
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
