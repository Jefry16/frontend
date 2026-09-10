export interface MediaAsset {
	id: string;
	context: "media";
	url: string;
	contentType: string;
	sizeBytes: number;
	originalName: string;
	alt: string | null;
	width: number | null;
	height: number | null;
	createdAt: string;
	uploadedBy: {
		id: string;
		context: "users";
		name: string | null;
	};
}
