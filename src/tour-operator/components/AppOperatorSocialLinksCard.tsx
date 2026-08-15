import { Plus, X } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { SelectItem } from "#/components/ui/select";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppCardBody } from "#/shared/components/AppCardBody";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormSkeleton } from "#/shared/components/AppFormSkeleton";
import { AppSelectField } from "#/shared/components/AppSelectField";
import { useBrand, useBrandSocialLinksForm } from "../hooks/use-operator-brand";
import { SOCIAL_PLATFORMS, socialPlatformLabel } from "../social-platforms";
import type { Brand } from "../types";

export const AppOperatorSocialLinksCard = ({
	tourOperatorId,
	canWrite,
}: {
	tourOperatorId: string;
	canWrite: boolean;
}) => {
	const query = useBrand(tourOperatorId);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{m.brand_social_links()}</CardTitle>
				<CardDescription>{m.brand_social_links_hint()}</CardDescription>
			</CardHeader>
			<CardContent>
				<AppCardBody
					query={query}
					loading={<AppFormSkeleton rows={2} card={false} />}
				>
					{(brand) =>
						canWrite ? (
							<SocialLinksForm tourOperatorId={tourOperatorId} brand={brand} />
						) : (
							<SocialLinksSummary brand={brand} />
						)
					}
				</AppCardBody>
			</CardContent>
		</Card>
	);
};

const SocialLinksForm = ({
	tourOperatorId,
	brand,
}: {
	tourOperatorId: string;
	brand: Brand;
}) => {
	const { form, isPending, errorMessage } = useBrandSocialLinksForm(
		tourOperatorId,
		brand,
	);

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			{errorMessage && (
				<AppAlert title={m.error()} description={errorMessage} />
			)}

			<form.Field name="socialLinks" mode="array">
				{(links) => {
					const rows = links.state.value ?? [];
					const taken = new Set(rows.map((l) => l.platform));
					const free = SOCIAL_PLATFORMS.filter((p) => !taken.has(p));

					return (
						<div className="flex flex-col gap-3">
							{rows.map((row, index) => (
								// The platform is editable and rows carry no id, so the
								// position is the only identity available.
								// biome-ignore lint/suspicious/noArrayIndexKey: see above
								<div key={index} className="flex items-end gap-2">
									<div className="w-44 shrink-0">
										<form.Field name={`socialLinks[${index}].platform`}>
											{(field) => (
												<AppSelectField
													field={field}
													label={m.social_platform()}
													hideLabel={index > 0}
												>
													{/* Only what is still free, plus this row's own
													    pick — otherwise reopening the select on an
													    existing row would show it as unavailable. */}
													{SOCIAL_PLATFORMS.filter(
														(p) => !taken.has(p) || p === row.platform,
													).map((platform) => (
														<SelectItem key={platform} value={platform}>
															{socialPlatformLabel(platform)}
														</SelectItem>
													))}
												</AppSelectField>
											)}
										</form.Field>
									</div>
									<div className="flex-1">
										<form.Field name={`socialLinks[${index}].url`}>
											{(field) => (
												<AppField
													field={field}
													label={m.social_url()}
													hideLabel={index > 0}
													placeholder="https://"
												/>
											)}
										</form.Field>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										aria-label={m.remove()}
										className="mb-1 shrink-0"
										onClick={() => form.removeFieldValue("socialLinks", index)}
									>
										<X />
									</Button>
								</div>
							))}
							<div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									// Every platform is spoken for; a ninth row could only
									// duplicate one, which the backend answers with a 422.
									disabled={free.length === 0}
									onClick={() =>
										form.pushFieldValue("socialLinks", {
											platform: free[0],
											url: "",
										})
									}
								>
									<Plus />
									{m.add_social_link()}
								</Button>
							</div>
						</div>
					);
				}}
			</form.Field>

			<AppFormActions isPending={isPending} submitLabel={m.save_changes()} />
		</form>
	);
};

const SocialLinksSummary = ({ brand }: { brand: Brand }) => {
	if (brand.socialLinks.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">
				{m.brand_social_links_empty()}
			</p>
		);
	}

	return (
		<dl className="flex flex-col gap-4">
			{brand.socialLinks.map((link) => (
				<AppDetailField
					key={link.platform}
					label={socialPlatformLabel(link.platform)}
				>
					{link.url}
				</AppDetailField>
			))}
		</dl>
	);
};
