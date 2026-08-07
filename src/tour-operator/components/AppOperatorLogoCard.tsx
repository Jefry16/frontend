import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import * as m from "#/paraglide/messages";
import { AppConfirmDialog } from "#/shared/components/AppConfirmDialog";
import { AppImageDropzone } from "#/shared/components/AppImageDropzone";
import { useOperatorLogo } from "../hooks/use-operator-logo";

// Read-only face: the logo as it stands, or nothing set.
const AppImageFrame = ({ logoUrl }: { logoUrl: string | null }) =>
	logoUrl ? (
		<img
			src={logoUrl}
			alt={m.logo()}
			className="size-28 rounded-md border object-cover"
		/>
	) : (
		<p className="text-sm text-muted-foreground">{m.not_set()}</p>
	);

const MAX_LOGO_BYTES = 25 * 1024 * 1024;

// The operator-logo settings card: current logo (Avatar, falling back to the
// name's initial like the switcher) + a drag-and-drop / click dropzone that
// uploads on selection, and a destructive Remove behind a confirm dialog.
export const AppOperatorLogoCard = ({
	tourOperatorId,
	logoUrl,
	canWrite,
}: {
	tourOperatorId: string;
	logoUrl: string | null;
	/** ADMIN+. False shows the current logo without the dropzone or Remove. */
	canWrite: boolean;
}) => {
	const { upload, clear, isUploading, isClearing } =
		useOperatorLogo(tourOperatorId);
	const [localError, setLocalError] = useState<string | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{m.logo()}</CardTitle>
				<CardDescription>{m.logo_description()}</CardDescription>
			</CardHeader>
			<CardContent>
				{!canWrite ? (
					<AppImageFrame logoUrl={logoUrl} />
				) : (
					<>
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
							<AppImageDropzone
								className="size-28 min-h-0 shrink-0"
								previewUrl={logoUrl}
								accept="image/*"
								maxBytes={MAX_LOGO_BYTES}
								pending={isUploading}
								disabled={isUploading || isClearing}
								errorMessages={{
									wrongType: m.logo_wrong_type(),
									tooLarge: m.logo_too_large(),
								}}
								onFile={(file) => {
									setLocalError(null);
									upload(file);
								}}
								onError={setLocalError}
							/>
							<div className="flex flex-col items-start gap-3">
								<div className="space-y-1">
									<p className="text-sm">{m.drag_or_click()}</p>
									<p className="text-xs text-muted-foreground">
										{m.logo_constraints()}
									</p>
								</div>
								{logoUrl && (
									<Button
										variant="outline"
										size="sm"
										className="text-destructive hover:text-destructive"
										disabled={isUploading || isClearing}
										onClick={() => setConfirmOpen(true)}
									>
										{m.remove_logo()}
									</Button>
								)}
							</div>
						</div>
						{localError && (
							<p className="mt-3 text-sm text-destructive">{localError}</p>
						)}
					</>
				)}
			</CardContent>

			{canWrite && (
				<AppConfirmDialog
					open={confirmOpen}
					onOpenChange={setConfirmOpen}
					title={m.remove_logo_title()}
					description={m.remove_logo_body()}
					confirmLabel={m.remove_logo()}
					destructive
					pending={isClearing}
					onConfirm={() =>
						clear(undefined, { onSuccess: () => setConfirmOpen(false) })
					}
				/>
			)}
		</Card>
	);
};
