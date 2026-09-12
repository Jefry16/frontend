import { useUiLabels } from "../labels";
import { AppAlert } from "./AppAlert";

export const AppTranslationNotice = () => {
	const labels = useUiLabels();
	return (
		<AppAlert
			variant="info"
			title={labels.translation}
			description={labels.translationFallbackHelp}
		/>
	);
};
