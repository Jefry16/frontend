import type { ReactNode } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { Spinner } from "#/components/ui/spinner";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppAuthShell } from "./AppAuthShell";

interface AppAuthFormWrapperProps {
	children: ReactNode;
	footer?: ReactNode;
	form: { handleSubmit: () => void };
	title: string;
	subtitle?: string;
	submitLabel: string;
	errorMessage?: string | null;
	isSubmitting: boolean;
}

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
		<AppAuthShell title={title} subtitle={subtitle}>
			<Card>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						{errorMessage && <AppAlert description={errorMessage} />}
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
		</AppAuthShell>
	);
};
