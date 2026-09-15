import { Button, Spinner } from "@vointika/ui";
import * as m from "#/paraglide/messages";

export const AppClearTranslationButton = ({
	isClearing,
	disabled,
	onClick,
}: {
	isClearing: boolean;
	disabled: boolean;
	onClick: () => void;
}) => (
	<Button
		type="button"
		variant="outline"
		disabled={disabled || isClearing}
		onClick={onClick}
	>
		{isClearing && <Spinner className="size-4" />}
		{m.clear_translation()}
	</Button>
);
