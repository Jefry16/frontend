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
	createdAt: string;
	uploadedBy: {
		id: string;
		context: "users";
		name: string | null;
	};
}
