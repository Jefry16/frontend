export interface ContactMessageListItem {
	id: string;
	context: "contact-messages";
	name: string | null;
	email: string;
	summary: string;
	createdAt: string;
}

export interface ContactMessage extends ContactMessageListItem {
	content: string;
}
