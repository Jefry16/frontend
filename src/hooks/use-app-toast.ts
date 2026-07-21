import { toast } from "sonner";
import * as m from "#/paraglide/messages";

export const useAppToast = () => ({
	created: (resource: string) =>
		toast.success(m.resource_created({ resource })),
	updated: (resource: string) =>
		toast.success(m.resource_updated({ resource })),
	deleted: (resource: string) =>
		toast.success(m.resource_deleted({ resource })),
	success: (message: string) => toast.success(message),
	error: (message: string) => toast.error(message),
});
