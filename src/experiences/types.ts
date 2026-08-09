// Media is resolved to URLs at read time, never stored. List rows and the detail
// share this shape.
export interface Experience {
	id: string;
	context: "experiences";
	name: string;
	handle: string;
	description: string;
	longDescription: string;
	featured: boolean;
	tags: string[];
	included: string[];
	notIncluded: string[];
	highlights: string[];
	// The raw references, for editing; the URLs above are for display.
	thumbnailMediaId: string | null;
	thumbnailUrl: string | null;
	mediaIds: string[];
	galleryUrls: string[];
	durationMinutes: number;
	bookingCutoffHours: number;
	published: boolean;
	createdBy: string;
	createdAt: string;
}

// null means untranslated, so the storefront falls back to the canonical field.
// Tags are deliberately absent — they are not translated. `handle` is per-locale.
export interface ExperienceTranslation {
	locale: string;
	name: string | null;
	description: string | null;
	longDescription: string | null;
	highlights: string[] | null;
	included: string[] | null;
	notIncluded: string[] | null;
	handle: string | null;
}
