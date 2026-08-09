import type { ReactNode } from "react";
import { Card, CardContent } from "#/components/ui/card";
import * as m from "#/paraglide/messages";
import { AppAlert } from "./AppAlert";

interface AppFormCardProps {
	/** `form.handleSubmit` at every call site — form-core binds it, so a bare reference is safe. */
	onSubmit: () => void | Promise<void>;
	errorMessage?: string | null;
	notice?: ReactNode;
	actions?: ReactNode;
	children: ReactNode;
}

// Field layout is deliberately left to the caller's own `<FieldGroup>`: two of
// them group differently, and folding the wrapper in here would reflow the rest.
export const AppFormCard = ({
	onSubmit,
	errorMessage,
	notice,
	actions,
	children,
}: AppFormCardProps) => (
	<Card>
		<CardContent>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit();
				}}
				className="space-y-4"
			>
				{notice}
				{errorMessage && (
					<AppAlert title={m.error()} description={errorMessage} />
				)}
				{children}
				{actions}
			</form>
		</CardContent>
	</Card>
);
