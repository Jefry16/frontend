interface ExperienceCategoryRef {
	id: string;
	context: "categories";
	name: string;
	handle: string;
}

export interface Experience {
	id: string;
	context: "experiences";
	name: string;
	handle: string;
	description: string;
	longDescription: string;
	featured: boolean;
	thumbnailMediaId: string | null;
	thumbnailUrl: string | null;
	mediaIds: string[];
	galleryUrls: string[];
	bookingCutoffHours: number;
	seoTitle: string | null;
	seoDescription: string | null;
	startingPrice: number;
	category: ExperienceCategoryRef | null;
	published: boolean;
	createdBy: string;
	createdAt: string;
}

export interface ExperienceTranslation {
	locale: string;
	name: string | null;
	description: string | null;
	longDescription: string | null;
	handle: string | null;
	seoTitle: string | null;
	seoDescription: string | null;
}
