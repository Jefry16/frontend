import { ImageUp } from "lucide-react";
import { type DragEvent, useRef, useState } from "react";
import { Spinner } from "#/components/ui/spinner";
import { cn } from "#/lib/utils";

interface AppImageDropzoneProps {
	onFile: (file: File) => void;
	// Called with a copy-owned message when the picked file fails validation.
	onError?: (message: string) => void;
	// A file `accept` string — "image/*", explicit types, or a comma list.
	accept?: string;
	maxBytes?: number;
	pending?: boolean;
	disabled?: boolean;
	hint?: string;
	// A plain URL to show as the filled preview. This component never creates
	// object URLs — a caller that passes an object URL must revoke it itself.
	previewUrl?: string | null;
	// The two validation messages (the component stays feature/i18n-agnostic).
	errorMessages?: { wrongType: string; tooLarge: string };
	// Sizes/shapes the drop target — e.g. "size-28 min-h-0" for a square tile.
	// Defaults to a full-width box.
	className?: string;
}

// Whether a file matches an `accept` string (handles "image/*", explicit MIME
// types, and comma-separated lists).
const matchesAccept = (file: File, accept: string): boolean =>
	accept
		.split(",")
		.map((a) => a.trim())
		.some((token) => {
			if (!token || token === "*/*") return true;
			if (token.endsWith("/*")) return file.type.startsWith(token.slice(0, -1));
			return file.type === token;
		});

// A generic drag-and-drop image picker: a real <button> that also opens the file
// dialog on click or Enter/Space. When `previewUrl` is set it fills with the
// image (a hover overlay signals it's replaceable); otherwise it's a dashed
// placeholder. Validates type + size client-side and reports violations via
// onError (no network call for a bad file). Sizes to its container by default;
// pass `className` for a fixed tile. MUST NOT import any feature module, and does
// NOT create object URLs.
export const AppImageDropzone = ({
	onFile,
	onError,
	accept = "image/*",
	maxBytes,
	pending = false,
	disabled = false,
	hint,
	previewUrl,
	errorMessages,
	className,
}: AppImageDropzoneProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const inert = disabled || pending;

	const handleFile = (file: File | undefined) => {
		if (!file) return;
		if (!matchesAccept(file, accept)) {
			onError?.(errorMessages?.wrongType ?? "Unsupported file type");
			return;
		}
		if (maxBytes !== undefined && file.size > maxBytes) {
			onError?.(errorMessages?.tooLarge ?? "File is too large");
			return;
		}
		onFile(file);
	};

	const onDrop = (e: DragEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setIsDragging(false);
		if (inert) return;
		handleFile(e.dataTransfer.files?.[0]);
	};

	return (
		<>
			<input
				ref={inputRef}
				type="file"
				accept={accept}
				disabled={inert}
				className="sr-only"
				onChange={(e) => {
					handleFile(e.target.files?.[0]);
					// Reset so re-picking the same file fires onChange again.
					e.target.value = "";
				}}
			/>
			<button
				type="button"
				aria-disabled={inert || undefined}
				onClick={() => {
					if (!inert) inputRef.current?.click();
				}}
				onDragEnter={(e) => {
					e.preventDefault();
					if (!inert) setIsDragging(true);
				}}
				onDragOver={(e) => {
					e.preventDefault();
					if (!inert) setIsDragging(true);
				}}
				onDragLeave={() => setIsDragging(false)}
				onDrop={onDrop}
				className={cn(
					"group relative flex min-h-40 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-input bg-muted/30 text-center transition-colors motion-reduce:transition-none",
					"hover:border-muted-foreground/40 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
					isDragging && "border-primary bg-accent",
					inert && "pointer-events-none opacity-60",
					className,
				)}
			>
				{pending ? (
					<Spinner className="size-6 text-muted-foreground" />
				) : previewUrl ? (
					<>
						<img
							src={previewUrl}
							alt=""
							className="absolute inset-0 size-full object-cover"
						/>
						<span className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:transition-none">
							<ImageUp className="size-5" />
						</span>
					</>
				) : (
					<span className="flex flex-col items-center gap-2 px-4">
						<ImageUp className="size-6 text-muted-foreground" />
						{hint && (
							<span className="text-sm text-muted-foreground">{hint}</span>
						)}
					</span>
				)}
			</button>
		</>
	);
};
