// An em dash standing in for a value the record doesn't carry — an unset SEO
// title, a member with no name. Muted, so an absent value reads as absent
// rather than as content. Sits beside RequiredMark as a one-glyph affordance:
// not an `App*` component, so no story is owed.
export const EmptyValue = () => (
	<span className="text-muted-foreground">—</span>
);
