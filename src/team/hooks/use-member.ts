import { useResource } from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import type { Member } from "../types";

export const useMember = (tourOperatorId: string, userId: string) =>
	useResource<Member>(
		queryKeys.member(tourOperatorId, userId),
		`/tour-operators/${tourOperatorId}/members/${userId}`,
	);
