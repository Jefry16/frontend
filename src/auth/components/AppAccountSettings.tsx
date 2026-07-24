import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { useAuth } from "../AuthProvider";
import { AppChangePasswordForm } from "./AppChangePasswordForm";
import { AppLanguageCard } from "./AppLanguageCard";
import { AppUserAvatarCard } from "./AppUserAvatarCard";

// The signed-in user's own account settings (avatar + password) — a Settings
// section. User-level, so it reads the profile from useAuth rather than an
// operator-scoped query; `tourOperatorId` only scopes the Settings breadcrumb.
export const AppAccountSettings = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { user } = useAuth();
	if (!user) return null;

	return (
		<>
			<AppPageHeader
				title={m.account()}
				description={m.account_description()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{
								label: m.settings(),
								to: "/tour-operators/$tourOperatorId/settings",
								params: { tourOperatorId },
							},
							{ label: m.account() },
						]}
					/>
				}
			/>
			<div className="flex flex-col gap-6">
				<AppUserAvatarCard avatarUrl={user.avatarUrl} />
				<AppLanguageCard />
				<AppChangePasswordForm />
			</div>
		</>
	);
};
