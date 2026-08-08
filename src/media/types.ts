// One media-library asset (GET /tour-operators/{id}/media). `id` is the media
// id, `context` is "media". `url` is resolved from storage at read time.
// `uploadedBy` mirrors the invitation `invitedBy` (id + context:"users" + a
// best-effort name).
export interface MediaAsset {
	id: string;
	context: "media";
	url: string;
	contentType: string;
	sizeBytes: number;
	originalName: string;
	/** What the image shows, for screen readers and broken-image fallback. Only
	 * the uploader knows it, so it is written after the upload; null until then. */
	alt: string | null;
	/** Measured from the bytes on upload; null for a non-image asset. */
	width: number | null;
	height: number | null;
	createdAt: string;
	uploadedBy: {
		id: string;
		context: "users";
		name: string | null;
	};
}
