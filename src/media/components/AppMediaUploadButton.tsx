import { Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { MEDIA_ACCEPT, useMediaUpload } from "../hooks/use-media-upload";

// The media-library Upload action (page-header button): opens a multi-file
// picker restricted to the allowed types, then hands the selection to the hook
// (which validates + uploads + invalidates the list).
export const AppMediaUploadButton = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { upload, isPending } = useMediaUpload(tourOperatorId);
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<>
			<input
				ref={inputRef}
				type="file"
				multiple
				accept={MEDIA_ACCEPT}
				className="hidden"
				onChange={(e) => {
					const files = Array.from(e.target.files ?? []);
					// Reset so selecting the same file again still fires onChange.
					e.target.value = "";
					if (files.length > 0) upload(files);
				}}
			/>
			<Button
				type="button"
				onClick={() => inputRef.current?.click()}
				disabled={isPending}
			>
				{isPending ? (
					<Spinner className="size-4" />
				) : (
					<Upload className="size-4" />
				)}
				{m.upload()}
			</Button>
		</>
	);
};
