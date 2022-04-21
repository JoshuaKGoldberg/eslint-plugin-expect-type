import ts from 'typescript';
import { SetRequiredNonNullable } from './types';

export type DiagnosticWithStart = SetRequiredNonNullable<ts.Diagnostic, 'start'>;

export function isDiagnosticWithStart(diagnostic: ts.Diagnostic): diagnostic is DiagnosticWithStart {
  return !!diagnostic.start;
}
