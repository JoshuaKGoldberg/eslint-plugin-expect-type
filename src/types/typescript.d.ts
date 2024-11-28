import { TransformationContext } from "typescript";

declare module "typescript" {
	export const nullTransformationContext: TransformationContext;
}
