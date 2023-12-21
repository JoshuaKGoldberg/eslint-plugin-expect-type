import ts from "typescript";

import { SetRequiredNonNullable } from "./types.js";

export type DiagnosticWithStart = SetRequiredNonNullable<
	ts.Diagnostic,
	"start"
>;

export function isDiagnosticWithStart(
	diagnostic: ts.Diagnostic,
): diagnostic is DiagnosticWithStart {
	return !!diagnostic.start;
}
