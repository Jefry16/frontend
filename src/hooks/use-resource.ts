import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";

export const useResource = <T>(queryKey: readonly unknown[], url: string) =>
	useQuery({
		queryKey,
		queryFn: async () => {
			const { data } = await authApi.get<T>(url);
			return data;
		},
	});
