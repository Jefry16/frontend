/** Human file size: "240 KB", "1.2 MB". */
export const formatBytes = (bytes: number): string => {
	if (bytes < 1024) return `${bytes} B`;
	const kb = bytes / 1024;
	if (kb < 1024) return `${Math.round(kb)} KB`;
	return `${(kb / 1024).toFixed(1)} MB`;
};

/** Short type label from a MIME type: "image/png" → "PNG", "application/pdf" → "PDF". */
export const mimeLabel = (contentType: string): string => {
	const sub = contentType.split("/")[1] ?? contentType;
	return (sub.split("+")[0] ?? sub).toUpperCase();
};

export const isImage = (contentType: string): boolean =>
	contentType.startsWith("image/");
