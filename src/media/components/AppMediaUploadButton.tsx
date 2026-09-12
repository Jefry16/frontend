import { Button, Spinner } from "@vointika/ui";
import { Upload } from "lucide-react";
import { useRef } from "react";
import * as m from "#/paraglide/messages";
import { MEDIA_ACCEPT, useMediaUpload } from "../hooks/use-media-upload";

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
