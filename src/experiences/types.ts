// One experience (GET /tour-operators/{id}/experiences[/{id}]). `id` +
// `context:"experiences"` per the house convention. Media is resolved to URLs at
// read time (thumbnailUrl + galleryUrls), never stored. `published`/`featured`
// are booleans (there is no DRAFT/PUBLISHED enum). List rows and the detail share
// this shape.
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
	// Raw media references (for editing) alongside the resolved URLs (for display).
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

// One locale's translation overlay (GET/PUT/DELETE .../translations/{locale}).
// `locale` is its identity; every content field is nullable — null means
// untranslated, so the storefront falls back to the canonical experience field.
// Tags aren't translated (no `tags` here); `handle` is per-locale.
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
