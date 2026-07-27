import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppTextareaField } from "#/shared/components/AppTextareaField";
import { usePageForm } from "../hooks/use-page-form";
import type { Page } from "../types";

// The page form — create (no `page`; includes the permanent handle) or edit
// (content + SEO + template; the handle changes only through Rename on the
// detail). Body is raw HTML in a plain textarea — stored exactly as written.
export const AppPageForm = ({
	tourOperatorId,
	page,
}: {
	tourOperatorId: string;
	page?: Page;
}) => {
	const { form, isPending, errorMessage, isEdit } = usePageForm(
		tourOperatorId,
		page,
	);

	return (
		<Card>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					{errorMessage && (
						<AppAlert title={m.error()} description={errorMessage} />
					)}
					<FieldGroup>
						<form.Field name="title">
							{(field) => <AppField field={field} label={m.title()} required />}
						</form.Field>
						{!isEdit && (
							<form.Field name="handle">
								{(field) => (
									<AppField
										field={field}
										label={m.handle()}
										description={m.handle_hint()}
										required
									/>
								)}
							</form.Field>
						)}
						<form.Field name="body">
							{(field) => (
								<AppTextareaField
									field={field}
									label={m.page_body()}
									description={m.page_body_hint()}
									rows={14}
									required
								/>
							)}
						</form.Field>
						<form.Field name="seoTitle">
							{(field) => (
								<AppField
									field={field}
									label={m.seo_title()}
									description={m.seo_title_hint()}
								/>
							)}
						</form.Field>
						<form.Field name="seoDescription">
							{(field) => (
								<AppTextareaField
									field={field}
									label={m.seo_description()}
									description={m.seo_description_hint()}
									rows={3}
								/>
							)}
						</form.Field>
						{isEdit && (
							<form.Field name="templateSuffix">
								{(field) => (
									<AppField
										field={field}
										label={m.template_suffix()}
										description={m.template_suffix_hint()}
									/>
								)}
							</form.Field>
						)}
					</FieldGroup>
					<AppFormActions
						isPending={isPending}
						submitLabel={isEdit ? m.save_changes() : m.create()}
					/>
				</form>
			</CardContent>
		</Card>
	);
};
