// The contact inbox: shopper-submitted contact-form messages (Operations →
// Inbox). Read-only content — the write path is the storefront arc's intake
// endpoint; the admin reads, triages read-state, and deletes.

export interface ContactMessageListItem {
	id: string;
	context: "contact-messages";
	/** The shopper's name; themes may not collect one. */
	name: string | null;
	email: string;
	summary: string;
	read: boolean;
	createdAt: string;
}

export interface ContactMessage extends Omit<ContactMessageListItem, "read"> {
	content: string;
	read: boolean;
	readAt: string | null;
}
