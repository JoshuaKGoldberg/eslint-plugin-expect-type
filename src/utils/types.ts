export type SetRequiredNonNullable<BaseType, Keys extends keyof BaseType> = {
	[K in Keys]: NonNullable<BaseType[K]>;
} & Omit<BaseType, Keys>;
