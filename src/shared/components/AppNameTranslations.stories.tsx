import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import { AppNameTranslations } from "./AppNameTranslations";

const OP = "op-1";
const AUD = "a-1";
const BASE = `/tour-operators/${OP}/audiences/${AUD}/translations`;
const KEY = queryKeys.audienceTranslations(OP, AUD);

// Two translatable locales (es translated, fr not) — the wrapper normally
// derives these from the operator's locales; the story passes them directly.
function client() {
	const qc = storyQueryClient();
	qc.setQueryData([...KEY], [{ locale: "es", name: "Adultos" }]);
	qc.setQueryData([...KEY, "es"], { locale: "es", name: "Adultos" });
	qc.setQueryData([...KEY, "fr"], { locale: "fr", name: null });
	return qc;
}

const LABELS: Record<string, string> = { es: "Spanish", fr: "French" };

const meta = {
	title: "Shared/AppNameTranslations",
	component: AppNameTranslations,
	args: {
		tourOperatorId: OP,
		endpointBase: BASE,
		queryKeyBase: KEY,
		canonicalName: "Adults",
		maxLength: 80,
		translatable: ["es", "fr"],
		localesPending: false,
		localeLabel: (code: string) => LABELS[code] ?? code,
	},
	decorators: [
		(Story) => (
			<QueryClientProvider client={client()}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppNameTranslations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
