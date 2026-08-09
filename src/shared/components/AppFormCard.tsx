import type { ReactNode } from "react";
import { Card, CardContent } from "#/components/ui/card";
import * as m from "#/paraglide/messages";
import { AppAlert } from "./AppAlert";

interface AppFormCardProps {
	/**
	 * Runs after `preventDefault` — `form.handleSubmit` at every call site.
	 * form-core binds it in the FormApi constructor, so the bare reference is
	 * safe. Every hook wires `useForm`'s own `onSubmit` to its mutation, so no
	 * form validates and then mutates by hand.
	 */
	onSubmit: () => void | Promise<void>;
	/** Server-error banner, rendered above the fields (inline, never a toast). */
	errorMessage?: string | null;
	/** Sits above the error banner — the translation editors' fallback note. */
	notice?: ReactNode;
	/** The footer: `AppFormActions`, or onboarding's full-width button. */
	actions?: ReactNode;
	children: ReactNode;
}

// The card every app form sits in — COMPONENTS.md §5's skeleton, which was
// copied by hand into eighteen files before this existed.
//
// AppAuthFormWrapper is the same idea for the auth pages and stays separate: it
// also owns the logo, the heading, and a footer that sits inside the card but
// outside the form, so it cannot be expressed as a slot here.
//
// Field layout is deliberately *not* decided here — callers keep their own
// `<FieldGroup>`. Two of them group their fields differently, and folding the
// wrapper in would have quietly reflowed the rest.
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
