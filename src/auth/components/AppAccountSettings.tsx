import { AppPageHeader } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/links";
import { useAuth } from "../AuthProvider";
import { AppChangePasswordForm } from "./AppChangePasswordForm";
import { AppLanguageCard } from "./AppLanguageCard";
import { AppUserAvatarCard } from "./AppUserAvatarCard";

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
