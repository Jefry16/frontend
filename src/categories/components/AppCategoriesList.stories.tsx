import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Category } from "../types";
import { AppCategoriesList } from "./AppCategoriesList";

const OP_ID = "op-1";

// `boat-trips-2` is the point of the handle column: the third row asked for the
// same name-derived address as the first and the backend appended a suffix, so
// the value is not guessable from the name.
const CATEGORIES: Category[] = [
	{
		id: "c-1",
		context: "categories",
		name: "Boat trips",
		handle: "boat-trips",
		createdAt: "2026-03-01T10:00:00Z",
	},
	{
		id: "c-2",
		context: "categories",
		name: "Food & drink",
		handle: "food-drink",
		createdAt: "2026-03-02T10:00:00Z",
	},
	{
		id: "c-3",
		context: "categories",
		name: "Boat Trips",
		handle: "boat-trips-2",
		createdAt: "2026-04-11T09:00:00Z",
	},
];

const qc = storyQueryClient();
qc.setQueryData(
	[
		...queryKeys.categories(OP_ID),
		`/tour-operators/${OP_ID}/categories`,
		[],
		[],
		undefined,
	],
	listPage(CATEGORIES),
);

const meta = {
	title: "Categories/AppCategoriesList",
	component: AppCategoriesList,
	args: { tourOperatorId: OP_ID },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<Story />
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppCategoriesList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
