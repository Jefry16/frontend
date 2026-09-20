import { AppAlert, AppCard, Button, FieldGroup, Spinner } from "@vointika/ui";
import type { ReactNode } from "react";
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
			<AppCard>
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
					<div className="mt-4 flex flex-col items-start gap-2 text-sm text-muted-foreground">
						{footer}
					</div>
				)}
			</AppCard>
		</AppAuthShell>
	);
};
