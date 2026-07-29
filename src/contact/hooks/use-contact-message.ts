import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { ContactMessage } from "../types";

// A single message with the full body. Any member; cross-tenant → 404.
export const useContactMessage = (tourOperatorId: string, messageId: string) =>
	useQuery({
		queryKey: queryKeys.contactMessage(tourOperatorId, messageId),
		queryFn: async () => {
			const { data } = await authApi.get<ContactMessage>(
				`/tour-operators/${tourOperatorId}/contact-messages/${messageId}`,
			);
			return data;
		},
	});
