import * as m from "#/paraglide/messages";
import type { MemberRole } from "./types";

/** Localized role name. */
export const roleLabel = (role: MemberRole): string =>
	role === "OWNER"
		? m.role_owner()
		: role === "ADMIN"
			? m.role_admin()
			: m.role_staff();

/** Badge variant per role — the owner stands out; the rest are neutral. */
export const roleBadgeVariant = (role: MemberRole): "default" | "secondary" =>
	role === "OWNER" ? "default" : "secondary";
