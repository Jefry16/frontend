import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { MetafieldDefinitionListItem, MetafieldValue } from "../types";
import { AppMetafieldTranslationsCard } from "./AppMetafieldTranslationsCard";

const OP = "op-1";
const OWNER = "e-1";
const LOCALE = "es";

const DEFINITIONS: MetafieldDefinitionListItem[] = [
	{
		id: "d-1",
		context: "metafield-definitions",
		ownerType: "experience",
		namespace: "custom",
		key: "difficulty",
		type: "single_line_text",
		metaobjectDefinitionId: null,
		name: "Difficulty",
		createdAt: "2026-07-20T10:00:00Z",
	},
	{
		id: "d-2",
		context: "metafield-definitions",
		ownerType: "experience",
		namespace: "custom",
		key: "what-to-bring",
		type: "multi_line_text",
		metaobjectDefinitionId: null,
		name: "What to bring",
		createdAt: "2026-07-20T10:00:00Z",
	},
	{
		id: "d-3",
		context: "metafield-definitions",
		ownerType: "experience",
		namespace: "specs",
		key: "max-altitude",
		type: "number_integer",
		metaobjectDefinitionId: null,
		name: "Max altitude (m)",
		createdAt: "2026-07-20T10:00:00Z",
	},
];

const VALUES: MetafieldValue[] = [
	{
		namespace: "custom",
		key: "difficulty",
		type: "single_line_text",
		name: "Difficulty",
		value: "Moderate",
		updatedAt: "2026-07-22T10:00:00Z",
	},
	{
		namespace: "custom",
		key: "what-to-bring",
		type: "multi_line_text",
		name: "What to bring",
		value: "Sunscreen and a hat",
		updatedAt: "2026-07-22T10:00:00Z",
	},
];

const seed = (overlay: Record<string, string>) =>
	storyQueryClient((qc) => {
		qc.setQueryData(
			[...queryKeys.metafieldDefinitions(OP), "all-pages"],
			listPage(DEFINITIONS),
		);
		qc.setQueryData(queryKeys.metafieldValues(OP, "experience", OWNER), VALUES);
		qc.setQueryData(
			queryKeys.metafieldTranslation(OP, "experience", OWNER, LOCALE),
			overlay,
		);
	});

const withClient = (overlay: Record<string, string>) => {
	const qc = seed(overlay);
	return (Story: () => React.ReactNode) => (
		<QueryClientProvider client={qc}>
			<div className="mx-auto w-full max-w-3xl">
				<Story />
			</div>
		</QueryClientProvider>
	);
};

const meta = {
	title: "Metafields/AppMetafieldTranslationsCard",
	component: AppMetafieldTranslationsCard,
	args: {
		tourOperatorId: OP,
		ownerType: "experience",
		ownerId: OWNER,
		locale: LOCALE,
		canWrite: true,
	},
} satisfies Meta<typeof AppMetafieldTranslationsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Untranslated: Story = {
	decorators: [withClient({})],
};

export const Translated: Story = {
	decorators: [
		withClient({
			"custom.difficulty": "Moderado",
			"custom.what-to-bring": "Protector solar y un sombrero",
		}),
	],
};

export const ReadOnly: Story = {
	args: { canWrite: false },
	decorators: [withClient({ "custom.difficulty": "Moderado" })],
};
