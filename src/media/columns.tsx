import type { ColumnDef } from "@tanstack/react-table";
import { EmptyValue } from "@vointika/ui";
import { FileText } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { timestampColumn } from "#/shared/components/table-columns";
import { formatBytes, isImage, mimeLabel } from "./format";
import type { MediaAsset } from "./types";

const typeItems = [
	{ value: "image/png", label: "PNG" },
	{ value: "image/jpeg", label: "JPEG" },
	{ value: "image/webp", label: "WebP" },
	{ value: "application/pdf", label: "PDF" },
];

export const mediaColumns = (
	tourOperatorId: string,
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
			enableSorting: true,
			header: (headerContext) => (
				<AppDataTableHeader label={m.name()} headerContext={headerContext} />
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
			enableSorting: true,
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.file_type()}
					headerContext={headerContext}
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
			enableSorting: true,
			header: (headerContext) => (
				<AppDataTableHeader label={m.size()} headerContext={headerContext} />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground tabular-nums">
					{formatBytes(row.original.sizeBytes)}
				</span>
			),
		},
		{
			id: "createdByName",
			enableSorting: true,
			header: (headerContext) => (
				<AppDataTableHeader
					label={m.uploaded_by()}
					headerContext={headerContext}
				/>
			),
			cell: ({ row }) => row.original.uploadedBy.name ?? <EmptyValue />,
		},
		timestampColumn<MediaAsset>("createdAt", m.added(), formatDate),
	];
};
