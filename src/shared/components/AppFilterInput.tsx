import type { ComponentProps } from "react";
import { Input } from "#/components/ui/input";

export function AppFilterInput(props: ComponentProps<typeof Input>) {
	return <Input className="h-8" {...props} />;
}
