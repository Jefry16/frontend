import type { Meta, StoryObj } from "@storybook/tanstack-react";
import type { HeaderContext } from "@tanstack/react-table";
import { useState } from "react";
import { AppSetFilter, type SetFilterItem } from "./AppSetFilter";

const ROLES: SetFilterItem[] = [
	{ value: "OWNER", label: "Owner" },
	{ value: "ADMIN", label: "Admin" },
	{ value: "STAFF", label: "Staff" },
];

const COUNTRIES: SetFilterItem[] = [
	"Argentina",
	"Australia",
	"Brazil",
	"Canada",
	"Chile",
	"Colombia",
	"Denmark",
	"Egypt",
	"France",
	"Germany",
	"Greece",
	"India",
	"Indonesia",
	"Italy",
	"Japan",
	"Kenya",
	"Mexico",
	"Morocco",
	"Netherlands",
	"Norway",
	"Peru",
	"Portugal",
	"Spain",
	"Sweden",
	"Thailand",
	"Turkey",
	"Vietnam",
].map((c) => ({ value: c.toLowerCase(), label: c }));

function Harness({ items }: { items: SetFilterItem[] }) {
	const [value, setValue] = useState<unknown>(undefined);
	const headerContext = {
		column: {
			getFilterValue: () => value,
			setFilterValue: (v: unknown) => setValue(v),
		},
	} as unknown as HeaderContext<unknown, unknown>;
	return (
		<div className="w-56 rounded-md border p-3">
			<AppSetFilter headerContext={headerContext} items={items} />
		</div>
	);
}

const meta = {
	title: "Shared/AppSetFilter",
	component: AppSetFilter,
	args: {
		headerContext: {
			column: {
				getFilterValue: () => undefined,
				setFilterValue: () => undefined,
			},
		} as unknown as HeaderContext<unknown, unknown>,
		items: ROLES,
	},
} satisfies Meta<typeof AppSetFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SmallSet: Story = { render: () => <Harness items={ROLES} /> };

export const LargeSetWithSearch: Story = {
	render: () => <Harness items={COUNTRIES} />,
};
