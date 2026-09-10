import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Category } from "../types";
import { AppCategoryTranslations } from "./AppCategoryTranslations";

const OP = "op-1";
const CAT = "c-1";

const CATEGORY: Category = {
	id: CAT,
	context: "categories",
	name: "Boat trips",
	handle: "boat-trips",
	createdAt: "2026-03-01T10:00:00Z",
};

function client() {
	const qc = storyQueryClient();
	qc.setQueryData(queryKeys.category(OP, CAT), CATEGORY);
	qc.setQueryData(queryKeys.operatorDetails(OP), {
		locales: {
			primaryLocale: "en",
			supportedLocales: ["en", "es"],
		},
	});
	const key = queryKeys.categoryTranslations(OP, CAT);
	qc.setQueryData([...key], []);
	// An untranslated locale answers 200 with a null name, not a 404.
	qc.setQueryData([...key, "es"], { locale: "es", name: null });
	return qc;
}

const meta = {
	title: "Categories/AppCategoryTranslations",
	component: AppCategoryTranslations,
	args: { tourOperatorId: OP, categoryId: CAT, canWrite: true },
	decorators: [
		(Story) => (
			<QueryClientProvider client={client()}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppCategoryTranslations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A STAFF member: the stored overlay, read-only — reads are member-level. */
export const ReadOnly: Story = {
	args: { canWrite: false },
};
