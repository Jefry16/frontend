import type { ReactNode } from "react";
import { Card, CardContent } from "#/components/ui/card";
import { AppAlert } from "./AppAlert";

interface AppFormCardProps {
	onSubmit: () => void | Promise<void>;
	errorMessage?: string | null;
	notice?: ReactNode;
	actions?: ReactNode;
	children: ReactNode;
}

export const AppFormCard = ({
	onSubmit,
	errorMessage,
	notice,
	actions,
	children,
}: AppFormCardProps) => (
	<Card>
		<CardContent>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit();
				}}
				className="space-y-4"
			>
				{notice}
				{errorMessage && <AppAlert description={errorMessage} />}
				{children}
				{actions}
			</form>
		</CardContent>
	</Card>
);
