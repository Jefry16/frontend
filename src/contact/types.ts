// The contact inbox: shopper-submitted contact-form messages (Operations →
// Inbox). Read-only content — the write path is the storefront arc's intake
// endpoint; the admin reads and deletes.

export interface ContactMessageListItem {
	id: string;
	context: "contact-messages";
	/** The shopper's name; themes may not collect one. */
	name: string | null;
	email: string;
	summary: string;
	createdAt: string;
}

// The detail read: the list row plus the verbatim body.
export interface ContactMessage extends ContactMessageListItem {
	content: string;
}
