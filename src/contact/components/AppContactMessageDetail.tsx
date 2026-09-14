import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	type AppAction,
	AppDetailField,
	AppFormSkeleton,
	AppPageActions,
	AppPageHeader,
	AppResourceView,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@vointika/ui";
import { Inbox, Mail, Trash2 } from "lucide-react";
import { useAppToast } from "#/hooks/use-app-toast";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { useContactMessage } from "../hooks/use-contact-message";
import { useContactMessageActions } from "../hooks/use-contact-message-actions";
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
			loading={<AppFormSkeleton rows={3} />}
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
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const { remove } = useContactMessageActions(tourOperatorId, message.id);

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
		{
			id: "delete",
			label: m.inbox_delete(),
			icon: Trash2,
			variant: "destructive",
			pending: remove.isPending,
			confirm: {
				title: m.inbox_delete_confirm_title(),
				description: m.inbox_delete_confirm_body(),
			},
			onSelect: () =>
				remove.mutate(undefined, {
					onSuccess: () => {
						toast.deleted(m.inbox_message());
						queryClient.removeQueries({
							queryKey: queryKeys.contactMessage(tourOperatorId, message.id),
						});
						navigate({
							to: "/tour-operators/$tourOperatorId/inbox",
							params: { tourOperatorId },
						});
					},
				}),
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

			<Card>
				<CardContent>
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{m.inbox_message()}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="whitespace-pre-wrap text-sm">{message.content}</p>
				</CardContent>
			</Card>
		</>
	);
};
