import { useNavigate } from "@tanstack/react-router";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	SidebarMenuButton,
} from "@vointika/ui";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useAuth } from "#/auth";
import * as m from "#/paraglide/messages";

interface AppTourOperatorSwitcherProps {
	activeId: string;
}

export const AppTourOperatorSwitcher = ({
	activeId,
}: AppTourOperatorSwitcherProps) => {
	const { user } = useAuth();
	const navigate = useNavigate();

	if (!user || user.tourOperators.length === 0) return null;

	const active =
		user.tourOperators.find((op) => op.id === activeId) ??
		user.tourOperators[0];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<SidebarMenuButton
					size="lg"
					tooltip={active.name}
					aria-label={m.switch_tour_operator()}
					className="bg-background hover:bg-background data-[state=open]:bg-background"
				>
					<Avatar size="sm">
						{active.logoUrl && (
							<AvatarImage src={active.logoUrl} alt={active.name} />
						)}
						<AvatarFallback>
							{active.name.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<span className="truncate font-medium">{active.name}</span>
					<ChevronsUpDown className="ml-auto size-4 opacity-60" />
				</SidebarMenuButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				sideOffset={4}
				className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
			>
				<DropdownMenuLabel className="text-xs text-muted-foreground">
					{m.tour_operators()}
				</DropdownMenuLabel>
				{user.tourOperators.map((op) => (
					<DropdownMenuItem
						key={op.id}
						onSelect={() =>
							navigate({
								to: "/tour-operators/$tourOperatorId",
								params: { tourOperatorId: op.id },
							})
						}
					>
						<Avatar size="sm">
							{op.logoUrl && <AvatarImage src={op.logoUrl} alt={op.name} />}
							<AvatarFallback>{op.name.charAt(0).toUpperCase()}</AvatarFallback>
						</Avatar>
						<span className="truncate">{op.name}</span>
						{op.id === active.id && (
							<Check className="ml-auto size-4 opacity-80" />
						)}
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onSelect={() => navigate({ to: "/tour-operators/new" })}
				>
					<Plus className="size-4" />
					<span>{m.new_tour_operator()}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
