import { Shapes } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useMetaobject } from "../hooks/use-metaobject";
import { useMetaobjectDefinition } from "../hooks/use-metaobject-definition";
import type { Metaobject } from "../types";
import { AppMetaobjectForm } from "./AppMetaobjectForm";

// The entry edit page: fetches the entry, then its definition (the form is
// generated from the field set), renders pre-filled.
export const AppMetaobjectEdit = ({
	tourOperatorId,
	metaobjectId,
}: {
	tourOperatorId: string;
	metaobjectId: string;
}) => {
	const query = useMetaobject(tourOperatorId, metaobjectId);

	return (
		<AppResourceView
			query={query}
			resource={m.metaobject()}
			icon={Shapes}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.content() }, { label: m.metaobjects() }]}
				/>
			}
			loading={<EditSkeleton />}
		>
			{(entry) => <EditView tourOperatorId={tourOperatorId} entry={entry} />}
		</AppResourceView>
	);
};

const EditSkeleton = () => (
	<Card>
		<CardContent className="flex flex-col gap-4">
			{["a", "b", "c"].map((k) => (
				<Skeleton key={k} className="h-9 w-full" />
			))}
		</CardContent>
	</Card>
);

const EditView = ({
	tourOperatorId,
	entry,
}: {
	tourOperatorId: string;
	entry: Metaobject;
}) => {
	const definition = useMetaobjectDefinition(
		tourOperatorId,
		entry.definitionId,
	);

	return (
		<AppResourceView
			query={definition}
			resource={m.metaobject_definition()}
			icon={Shapes}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.content() }, { label: m.metaobjects() }]}
				/>
			}
			loading={<EditSkeleton />}
		>
			{(def) => (
				<>
					<AppPageHeader
						title={m.edit_metaobject()}
						breadcrumb={
							<AppBreadcrumb
								items={[
									{ label: m.content() },
									{
										label: m.metaobjects(),
										to: "/tour-operators/$tourOperatorId/content/metaobjects",
										params: { tourOperatorId },
									},
									{
										label: entry.name,
										to: "/tour-operators/$tourOperatorId/content/metaobjects/entries/$metaobjectId",
										params: { tourOperatorId, metaobjectId: entry.id },
									},
									{ label: m.edit() },
								]}
							/>
						}
					/>
					<AppMetaobjectForm
						tourOperatorId={tourOperatorId}
						definition={def}
						entry={entry}
					/>
				</>
			)}
		</AppResourceView>
	);
};
