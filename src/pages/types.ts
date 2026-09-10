export interface PageListItem {
	id: string;
	context: "pages";
	title: string;
	handle: string;
	published: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Page {
	id: string;
	context: "pages";
	title: string;
	handle: string;
	body: string;
	seoTitle: string | null;
	seoDescription: string | null;
	published: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface PageTranslation {
	locale: string;
	title: string | null;
	body: string | null;
	seoTitle: string | null;
	seoDescription: string | null;
	handle: string | null;
}
