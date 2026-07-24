// One experience (GET /tour-operators/{id}/experiences[/{id}]). `id` +
// `context:"experiences"` per the house convention. Media is resolved to URLs at
// read time (thumbnailUrl + galleryUrls), never stored. `published`/`featured`
// are booleans (there is no DRAFT/PUBLISHED enum). List rows and the detail share
// this shape.
export interface Experience {
	id: string;
	context: "experiences";
	name: string;
	slug: string;
	description: string;
	longDescription: string;
	featured: boolean;
	tags: string[];
	included: string[];
	notIncluded: string[];
	highlights: string[];
	thumbnailUrl: string | null;
	galleryUrls: string[];
	durationMinutes: number;
	bookingCutoffHours: number;
	published: boolean;
	createdBy: string;
	createdAt: string;
}
