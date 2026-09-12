import {
	AppConfirmDialog,
	AppImageDropzone,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@vointika/ui";
import { useState } from "react";
import * as m from "#/paraglide/messages";
import { useUserAvatar } from "../hooks/use-user-avatar";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const AVATAR_TYPES = "image/jpeg,image/png,image/webp";

export const AppUserAvatarCard = ({
	avatarUrl,
}: {
	avatarUrl: string | null;
}) => {
	const { set, clear, isSetting, isClearing } = useUserAvatar();
	const [localError, setLocalError] = useState<string | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{m.avatar()}</CardTitle>
				<CardDescription>{m.avatar_description()}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
					<AppImageDropzone
						className="size-28 min-h-0 shrink-0 rounded-full"
						previewUrl={avatarUrl}
						accept={AVATAR_TYPES}
						maxBytes={MAX_AVATAR_BYTES}
						pending={isSetting}
						disabled={isSetting || isClearing}
						errorMessages={{
							wrongType: m.avatar_wrong_type(),
							tooLarge: m.avatar_too_large(),
						}}
						onFile={(file) => {
							setLocalError(null);
							set(file);
						}}
						onError={setLocalError}
					/>
					<div className="flex flex-col items-start gap-3">
						<div className="space-y-1">
							<p className="text-sm">{m.drag_or_click()}</p>
							<p className="text-xs text-muted-foreground">
								{m.avatar_constraints()}
							</p>
						</div>
						{avatarUrl && (
							<Button
								variant="outline"
								size="sm"
								className="text-destructive hover:text-destructive"
								disabled={isSetting || isClearing}
								onClick={() => setConfirmOpen(true)}
							>
								{m.remove_avatar()}
							</Button>
						)}
					</div>
				</div>
				{localError && (
					<p className="mt-3 text-sm text-destructive">{localError}</p>
				)}
			</CardContent>

			<AppConfirmDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title={m.remove_avatar_title()}
				description={m.remove_avatar_body()}
				confirmLabel={m.remove_avatar()}
				destructive
				pending={isClearing}
				onConfirm={() =>
					clear(undefined, { onSuccess: () => setConfirmOpen(false) })
				}
			/>
		</Card>
	);
};
