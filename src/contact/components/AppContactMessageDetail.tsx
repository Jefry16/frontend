import {
	type AppAction,
	AppCard,
	AppDetailField,
	AppDetailSkeleton,
	AppPageActions,
	AppPageHeader,
	AppResourceView,
} from "@vointika/ui";
import { Inbox, Mail } from "lucide-react";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { useContactMessage } from "../hooks/use-contact-message";
import type { ContactMessage } from "../types";

export const AppContactMessageDetail = ({
	tourOperatorId,
	messageId,
}: {
	tourOperatorId: string;
	messageId: string;
}) => {
	const query = useContactMessage(tourOperatorId, messageId);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/inbox"
			params={{ tourOperatorId }}
		>
			{m.back_to_inbox()}
		</AppBackLink>
	);

	return (
		<AppResourceView
			query={query}
			resource={m.inbox_message()}
			icon={Inbox}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.operations() }, { label: m.inbox() }]}
				/>
			}
			notFoundAction={backLink}
			loading={<AppDetailSkeleton fields={2} />}
		>
			{(message) => (
				<MessageView tourOperatorId={tourOperatorId} message={message} />
			)}
		</AppResourceView>
	);
};

const MessageView = ({
	tourOperatorId,
	message,
}: {
	tourOperatorId: string;
	message: ContactMessage;
}) => {
	const { formatDateTime } = useOperatorDateTime();

	const { canWrite } = usePermissions();
	const actions: AppAction[] = [
		{
			id: "reply",
			label: m.inbox_reply(),
			icon: Mail,
			member: true,
			onSelect: () => {
				window.location.href = `mailto:${message.email}?subject=${encodeURIComponent(
					`Re: ${message.summary}`,
				)}`;
			},
		},
	];

	return (
		<>
			<AppPageHeader
				title={message.summary}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.operations() },
							{
								label: m.inbox(),
								to: "/tour-operators/$tourOperatorId/inbox",
								params: { tourOperatorId },
							},
							{ label: message.summary },
						]}
					/>
				}
				actions={<AppPageActions actions={actions} canWrite={canWrite} />}
			/>

			<AppCard>
				<dl className="grid grid-cols-2 gap-4">
					<AppDetailField label={m.inbox_from()}>
						<div className="min-w-0">
							{message.name && <p className="text-sm">{message.name}</p>}
							<a
								href={`mailto:${message.email}`}
								className="text-sm text-muted-foreground underline-offset-4 hover:underline"
							>
								{message.email}
							</a>
						</div>
					</AppDetailField>
					<AppDetailField label={m.inbox_received()}>
						{formatDateTime(message.createdAt)}
					</AppDetailField>
				</dl>
			</AppCard>

			<AppCard title={m.inbox_message()}>
				<p className="whitespace-pre-wrap text-sm">{message.content}</p>
			</AppCard>
		</>
	);
};
