import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Category } from "../types";
import { AppCategoryDetail } from "./AppCategoryDetail";

const OP = "op-1";
const CAT = "c-1";

const CATEGORY: Category = {
	id: CAT,
	context: "categories",
	name: "Boat trips",
	handle: "boat-trips",
	createdAt: "2026-03-01T10:00:00Z",
};

const qc = storyQueryClient();
qc.setQueryData(queryKeys.category(OP, CAT), CATEGORY);
qc.setQueryData(queryKeys.activityTimeline(OP, "CATEGORY", CAT), listPage([]));

const meta = {
	title: "Categories/AppCategoryDetail",
	component: AppCategoryDetail,
	args: { tourOperatorId: OP, categoryId: CAT },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<div className="mx-auto w-full max-w-3xl">
						<Story />
					</div>
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppCategoryDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
