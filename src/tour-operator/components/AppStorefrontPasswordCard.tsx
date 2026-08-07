import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Checkbox } from "#/components/ui/checkbox";
import { FieldDescription, FieldGroup } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Skeleton } from "#/components/ui/skeleton";
import { Textarea } from "#/components/ui/textarea";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import {
	type StorefrontPasswordSettings,
	useStorefrontPassword,
	useStorefrontPasswordSave,
} from "../hooks/use-storefront-password";

// Settings → General → Store access (Shopify's password protection): restrict
// the storefront to visitors with the shared password, plus the optional
// message the password page shows. The password is member-visible by design —
// it's the gate the operator hands out, not a credential.
export const AppStorefrontPasswordCard = ({
	tourOperatorId,
	canWrite,
}: {
	tourOperatorId: string;
	/** ADMIN+. False shows the settings read-only — the read is member-level. */
	canWrite: boolean;
}) => {
	const query = useStorefrontPassword(tourOperatorId);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{m.store_access()}</CardTitle>
				<CardDescription>{m.store_access_hint()}</CardDescription>
			</CardHeader>
			<CardContent>
				{query.isPending ? (
					<div className="flex flex-col gap-4">
						{["a", "b", "c"].map((k) => (
							<Skeleton key={k} className="h-9 w-full" />
						))}
					</div>
				) : query.isError ? (
					<AppAlert title={m.error()} description={m.error()} />
				) : canWrite ? (
					<StoreAccessForm
						tourOperatorId={tourOperatorId}
						settings={query.data}
					/>
				) : (
					<StoreAccessSummary settings={query.data} />
				)}
			</CardContent>
		</Card>
	);
};

const StoreAccessForm = ({
	tourOperatorId,
	settings,
}: {
	tourOperatorId: string;
	settings: StorefrontPasswordSettings;
}) => {
	const save = useStorefrontPasswordSave(tourOperatorId);
	const [enabled, setEnabled] = useState(settings.enabled);
	const [password, setPassword] = useState(settings.password ?? "");
	const [message, setMessage] = useState(settings.message ?? "");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const submit = () => {
		// Mirror the backend's rule so the common case never round-trips.
		if (enabled && !password.trim()) {
			setErrorMessage(m.store_access_password_required());
			return;
		}
		setErrorMessage(null);
		save.mutate(
			{
				enabled,
				password: password.trim() || null,
				message: message.trim() || null,
			},
			{ onError: (error) => setErrorMessage(apiErrorMessage(error)) },
		);
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
			className="space-y-6"
		>
			{errorMessage && (
				<AppAlert title={m.error()} description={errorMessage} />
			)}
			<FieldGroup>
				{/* The Radix Checkbox is a <button>: htmlFor, never a wrapping label. */}
				<div className="flex items-start gap-2">
					<Checkbox
						id="store-access-enabled"
						checked={enabled}
						onCheckedChange={(checked) => setEnabled(checked === true)}
					/>
					<div className="flex flex-col gap-1">
						<Label htmlFor="store-access-enabled">
							{m.store_access_toggle()}
						</Label>
						<FieldDescription>{m.store_access_toggle_hint()}</FieldDescription>
					</div>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="store-access-password">{m.password()}</Label>
					<Input
						id="store-access-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="max-w-sm font-mono"
					/>
					<FieldDescription>{m.store_access_password_hint()}</FieldDescription>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="store-access-message">{m.visitor_message()}</Label>
					<Textarea
						id="store-access-message"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						rows={3}
					/>
					<FieldDescription>{m.visitor_message_hint()}</FieldDescription>
				</div>
			</FieldGroup>
			<AppFormActions
				isPending={save.isPending}
				submitLabel={m.save_changes()}
			/>
		</form>
	);
};

// Read-only face. The password itself stays visible — it is the gate the
// operator hands out, not a credential (the card's own premise).
const StoreAccessSummary = ({
	settings,
}: {
	settings: StorefrontPasswordSettings;
}) => {
	const none = <span className="text-muted-foreground">{m.not_set()}</span>;
	return (
		<div className="flex flex-col gap-6">
			<AppDetailField label={m.store_access()}>
				{settings.enabled ? m.store_access_on() : m.store_access_off()}
			</AppDetailField>
			<AppDetailField label={m.visitor_message()}>
				{settings.message ?? none}
			</AppDetailField>
		</div>
	);
};
