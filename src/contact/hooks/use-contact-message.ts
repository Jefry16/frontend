import { useResource } from "#/hooks/use-resource";
import { queryKeys } from "#/lib/query-keys";
import type { ContactMessage } from "../types";

export const useContactMessage = (tourOperatorId: string, messageId: string) =>
	useResource<ContactMessage>(
		queryKeys.contactMessage(tourOperatorId, messageId),
		`/tour-operators/${tourOperatorId}/contact-messages/${messageId}`,
	);
