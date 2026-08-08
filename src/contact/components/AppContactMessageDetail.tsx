import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Inbox, Mail, MailOpen, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useAppToast } from "#/hooks/use-app-toast";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import {
	type AppAction,
	AppPageActions,
} from "#/shared/components/AppPageActions";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useOperatorDateTime, usePermissions } from "#/tour-operator";
import { useContactMessage } from "../hooks/use-contact-message";
import { useContactMessageActions } from "../hooks/use-contact-message-actions";
import type { ContactMessage } from "../types";

// One inbox message: sender facts + the verbatim body. Opening an unread
// message auto-marks it read (silently — the inbox badge just clears);
// actions are Reply by email (mailto), Mark as unread, Delete (ADMIN+,
// confirmed — audited backend-side).
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
			loading={
				<Card>
					<CardContent className="flex flex-col gap-4">
						{["a", "b", "c"].map((k) => (
							<Skeleton key={k} className="h-9 w-full" />
						))}
					</CardContent>
				</Card>
			}
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
	const { setRead, remove } = useContactMessageActions(
		tourOperatorId,
		message.id,
	);

	// Opening an unread message reads it — silently, like any inbox.
	// biome-ignore lint/correctness/useExhaustiveDependencies: react to read-state only — the mutation's identity churns every render
	useEffect(() => {
		if (!message.read && !setRead.isPending) {
			setRead.mutate({ read: true });
		}
	}, [message.read]);

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
			id: "mark-unread",
			label: m.inbox_mark_unread(),
			icon: MailOpen,
			member: true,
			onSelect: () =>
				setRead.mutate(
					{ read: false },
					{
						onSuccess: () =>
							navigate({
								to: "/tour-operators/$tourOperatorId/inbox",
								params: { tourOperatorId },
							}),
					},
				),
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
