import { useAuth } from "../AuthProvider";
import { AppChangePasswordForm } from "./AppChangePasswordForm";
import { AppLanguageCard } from "./AppLanguageCard";
import { AppUserAvatarCard } from "./AppUserAvatarCard";

export const AppAccountSettings = () => {
	const { user } = useAuth();
	if (!user) return null;

	return (
		<>
			<AppUserAvatarCard avatarUrl={user.avatarUrl} />
			<AppLanguageCard />
			<AppChangePasswordForm />
		</>
	);
};
