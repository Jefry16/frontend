import {
	AppField,
	AppFormActions,
	AppFormCard,
	AppTextareaField,
	AppTranslationNotice,
	FieldGroup,
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppClearTranslationButton } from "#/shared/components/AppClearTranslationButton";
import { useMetaobjectTranslationForm } from "../hooks/use-metaobject-translation-form";
import type { TranslatableField } from "../validators/metaobject-translation";

export const AppMetaobjectTranslationForm = ({
	tourOperatorId,
	metaobjectId,
	locale,
	fields,
	translation,
}: {
	tourOperatorId: string;
	metaobjectId: string;
	locale: string;
	fields: TranslatableField[];
	translation: Record<string, string>;
}) => {
	const { form, errorMessage, isPending, clear, isClearing } =
		useMetaobjectTranslationForm({
			tourOperatorId,
			metaobjectId,
			locale,
			fields,
			translation,
		});

	return (
		<AppFormCard
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			notice={<AppTranslationNotice />}
			actions={
				<AppFormActions
					isPending={isPending}
					disabled={isClearing}
					submitLabel={m.save_translation()}
					secondary={
						Object.keys(translation).length > 0 && (
							<AppClearTranslationButton
								isClearing={isClearing}
								disabled={isPending}
								onClick={() => clear()}
							/>
						)
					}
				/>
			}
		>
			<FieldGroup>
				{fields.map((entryField) => (
					<form.Field key={entryField.key} name={entryField.key}>
						{(field) =>
							entryField.type === "multi_line_text" ? (
								<AppTextareaField
									field={field}
									label={entryField.name}
									description={m.translation_canonical({
										value: entryField.value,
									})}
									rows={6}
								/>
							) : (
								<AppField
									field={field}
									label={entryField.name}
									description={m.translation_canonical({
										value: entryField.value,
									})}
								/>
							)
						}
					</form.Field>
				))}
			</FieldGroup>
		</AppFormCard>
	);
};
