import type { ColumnDef } from "@tanstack/react-table";
import { FileText } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { formatBytes, isImage, mimeLabel } from "./format";
import type { MediaAsset } from "./types";

const dash = () => <span className="text-muted-foreground">—</span>;

// The type filter — the raw MIME is the filter value the backend stores. Only
// the four types the backend accepts (ContentType.ALLOWED), so every option can
// actually match a stored asset.
const typeItems = [
	{ value: "image/png", label: "PNG" },
	{ value: "image/jpeg", label: "JPEG" },
	{ value: "image/webp", label: "WebP" },
	{ value: "application/pdf", label: "PDF" },
];

// The media-library columns. Preview leads (thumbnail for images, a file icon for
// everything else). Only what the list schema supports gets affordances: type is
// a static set filter, Added (createdAt) is sortable (API default = newest first);
// the rest are display-only. A factory so the Added cell closes over the tz.
export const mediaColumns = (
	tourOperatorId: string,
	// From useOperatorDateTime — instants render in the OPERATOR's timezone.
	formatDate: (iso: string) => string,
): ColumnDef<MediaAsset, unknown>[] => {
	return [
		{
			id: "preview",
			header: () => <span className="font-semibold">{m.preview()}</span>,
			cell: ({ row }) =>
				isImage(row.original.contentType) ? (
					<img
						src={row.original.url}
						alt={row.original.originalName}
						loading="lazy"
						className="size-10 rounded-md border object-cover"
					/>
				) : (
					<div className="grid size-10 place-items-center rounded-md border text-muted-foreground">
						<FileText className="size-4" />
					</div>
				),
		},
		{
			id: "originalName",
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.name()}
					headerContext={headerContext}
					allowSorting
				/>
			),
			cell: ({ row }) => (
				<AppResourceLink
					to="/tour-operators/$tourOperatorId/content/media/$mediaId"
					params={{ tourOperatorId, mediaId: row.original.id }}
					className="font-medium"
				>
					{row.original.originalName}
				</AppResourceLink>
			),
		},
		{
			id: "contentType",
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.file_type()}
					headerContext={headerContext}
					allowSorting
					allowFiltering="set"
					items={typeItems}
				/>
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground">
					{mimeLabel(row.original.contentType)}
				</span>
			),
		},
		{
			id: "sizeBytes",
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.size()}
					headerContext={headerContext}
					allowSorting
				/>
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground tabular-nums">
					{formatBytes(row.original.sizeBytes)}
				</span>
			),
		},
		{
			id: "createdByName",
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.uploaded_by()}
					headerContext={headerContext}
					allowSorting
				/>
			),
			cell: ({ row }) => row.original.uploadedBy.name ?? dash(),
		},
		{
			id: "createdAt",
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.added()}
					headerContext={headerContext}
					allowSorting
				/>
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground">
					{formatDate(row.original.createdAt)}
				</span>
			),
		},
	];
};
