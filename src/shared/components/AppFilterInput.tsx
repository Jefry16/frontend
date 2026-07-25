import type { ComponentProps } from "react";
import { Input } from "#/components/ui/input";

// The compact input used inside column-filter popovers.
export function AppFilterInput(props: ComponentProps<typeof Input>) {
	return <Input className="h-8" {...props} />;
}
