import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useState } from "react";
import { AppLocaleTabs } from "./AppLocaleTabs";

const LABELS: Record<string, string> = {
	es: "Spanish",
	fr: "French",
	it: "Italian",
};

function Demo({ translated }: { translated: string[] }) {
	const [active, setActive] = useState<string>("es");
	return (
		<AppLocaleTabs
			locales={["es", "fr", "it"]}
			active={active}
			onSelect={setActive}
			translated={new Set(translated)}
			label={(code) => LABELS[code] ?? code}
		/>
	);
}

const meta = {
	title: "Shared/AppLocaleTabs",
	component: Demo,
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { translated: ["es"] } };
export const AllTranslated: Story = {
	args: { translated: ["es", "fr", "it"] },
};
export const NoneTranslated: Story = { args: { translated: [] } };
