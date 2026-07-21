import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";

interface AppAuthFormWrapperProps {
	children: ReactNode;
	footer?: ReactNode;
	form: { handleSubmit: () => void };
	title: string;
	subtitle?: string;
	submitLabel: string;
	/** Server-error banner, rendered above the fields (inline, never a toast). */
	errorMessage?: string | null;
	isSubmitting: boolean;
}

// The shared shell for the auth pages (login, register, …): logo + heading,
// a card with the inline error banner, the fields, a full-width pending-aware
// submit button, and an optional footer of links.
export const AppAuthFormWrapper = ({
	children,
	footer,
	form,
	title,
	subtitle,
	submitLabel,
	errorMessage,
	isSubmitting,
}: AppAuthFormWrapperProps) => {
	return (
		<div className="w-full max-w-sm">
			<div className="mb-6 flex flex-col items-center gap-1 text-center">
				<img src="/vointika-logo.svg" alt="Vointika" className="mb-2 h-28" />
				<h1 className="text-xl font-semibold tracking-tight">{title}</h1>
				{subtitle && (
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				)}
			</div>
			<Card>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						{errorMessage && (
							<Alert className="text-destructive *:data-[slot=alert-description]:text-destructive/90">
								<CircleAlert />
								<AlertTitle>{m.error()}</AlertTitle>
								<AlertDescription>{errorMessage}</AlertDescription>
							</Alert>
						)}
						<FieldGroup>{children}</FieldGroup>
						<Button type="submit" disabled={isSubmitting} className="w-full">
							{isSubmitting && <Spinner />}
							{submitLabel}
						</Button>
					</form>
					{footer && (
						<div className="mt-4 flex flex-col items-center gap-2 text-sm text-muted-foreground">
							{footer}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
