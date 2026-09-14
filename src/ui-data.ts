import type { UiDataClient } from "@vointika/ui";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";

export const appUiData: UiDataClient = {
	get: (url, options) =>
		authApi.get(url, { signal: options?.signal }).then((r) => r.data),
	errorMessage: (error) => apiErrorMessage(error),
};
