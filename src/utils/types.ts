export type SetRequiredNonNullable<
	BaseType,
	Keys extends keyof BaseType,
> = Omit<BaseType, Keys> & {
	[K in Keys]: NonNullable<BaseType[K]>;
};
