import ts from 'typescript';
import { JSONSchema4 } from 'json-schema';
import { TSESLint } from '@typescript-eslint/utils';
import { createRule } from '../utils/createRule';
import { getParserServices } from '../utils/getParserServices';
import { loc } from '../utils/loc';
import { getTypeSnapshot, updateTypeSnapshot } from '../utils/snapshot';

const messages = {
  TypeScriptCompileError: 'TypeScript compile error: {{ message }}',
  FileIsNotIncludedInTsconfig: 'Expected to find a file "{{ fileName }}" present.',
  TypesDoNotMatch: 'Expected type to be: {{ expected }}, got: {{ actual }}',
  OrphanAssertion: 'Can not match a node to this assertion.',
  Multiple$ExpectTypeAssertions: 'This line has 2 or more $ExpectType assertions.',
  ExpectedErrorNotFound: 'Expected an error on this line, but found none.',
  TypeSnapshotNotFound: 'Type Snapshot not found. Please consider running ESLint in FIX mode: eslint --fix',
  TypeSnapshotDoNotMatch: 'Expected type from Snapshot to be: {{ expected }}, got: {{ actual }}',
  SyntaxError: 'Syntax Error: {{ message }}',
};
type MessageIds = keyof typeof messages;

// The options this rule can take.
type Options = {
  // readonly expectError: boolean;
  // readonly expectType: boolean;
  // readonly expectTypeSnapshot: boolean;
  readonly disableExpectTypeSnapshotFix: boolean;
};

// The default options for the rule.
const defaultOptions: Options = {
  // expectError: true,
  // expectType: true,
  // expectTypeSnapshot: true,
  disableExpectTypeSnapshotFix: false,
};

// The schema for the rule options.
const schema: JSONSchema4 = [
  {
    type: 'object',
    properties: {
      // expectError: {
      //   type: 'boolean',
      // },
      // expectType: {
      //   type: 'boolean',
      // },
      // expectTypeSnapshot: {
      //   type: 'boolean',
      // },
      disableExpectTypeSnapshotFix: {
        type: 'boolean',
      },
    },
    additionalProperties: false,
  },
];

export const name = 'expect';
export const rule = createRule<[Options], MessageIds>({
  name,
  meta: {
    type: 'problem',
    docs: {
      description: 'Expects type error, type snapshot or type.',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    schema,
    messages,
  },
  defaultOptions: [defaultOptions],
  create(context, [options]) {
    validate(context, options);

    return {};
  },
});

function validate(context: TSESLint.RuleContext<MessageIds, [Options]>, options: Options): void {
  const parserServices = getParserServices(context);
  const { program } = parserServices;

  const fileName = context.getFilename();
  const sourceFile = program.getSourceFile(fileName)!;
  if (!sourceFile) {
    context.report({
      loc: {
        line: 1,
        column: 0,
      },
      messageId: 'FileIsNotIncludedInTsconfig',
      data: {
        fileName,
      },
    });
    return;
  }

  const checker = program.getTypeChecker();
  const languageService = ts.createLanguageService(getLanguageServiceHost(program));
  // Don't care about emit errors.
  const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
  if (sourceFile.isDeclarationFile || !/(?:\$Expect(Type|Error|^\?))|\^\?/.test(sourceFile.text)) {
    // Normal file.
    for (const diagnostic of diagnostics) {
      addDiagnosticFailure(diagnostic);
    }
    return;
  }

  const { errorLines, typeAssertions, twoSlashAssertions, duplicates, syntaxErrors } = parseAssertions(sourceFile);

  for (const line of duplicates) {
    context.report({
      messageId: 'Multiple$ExpectTypeAssertions',
      loc: {
        line: line + 1,
        column: 0,
      },
    });
  }

  const seenDiagnosticsOnLine = new Set<number>();

  for (const diagnostic of diagnostics) {
    const line = lineOfPosition(diagnostic.start!, sourceFile);
    seenDiagnosticsOnLine.add(line);
    if (!errorLines.has(line)) {
      addDiagnosticFailure(diagnostic);
    }
  }

  for (const line of errorLines) {
    if (!seenDiagnosticsOnLine.has(line)) {
      context.report({
        messageId: 'ExpectedErrorNotFound',
        loc: {
          line: line + 1,
          column: 0,
        },
      });
    }
  }

  for (const { type, line } of syntaxErrors) {
    context.report({
      messageId: 'SyntaxError',
      data: {
        message:
          type === 'MissingExpectType'
            ? '$ExpectType requires type argument (e.g. // $ExpectType "string")'
            : '$ExpectTypeSnapshot requires snapshot name argument (e.g. // $ExpectTypeSnapshot MainComponentAPI)',
      },
      loc: {
        line: line + 1,
        column: 0,
      },
    });
  }

  for (const [, assertion] of typeAssertions) {
    if (assertion.assertionType === 'snapshot') {
      assertion.expected = getTypeSnapshot(fileName, assertion.snapshotName);
    }
  }

  const { unmetExpectations, unusedAssertions } = getExpectTypeFailures(
    sourceFile,
    { typeAssertions, twoSlashAssertions },
    checker,
    languageService,
  );
  for (const { node, assertion, actual } of unmetExpectations) {
    const templateDescriptor = {
      data: {
        expected: assertion.expected,
        actual,
      },
      loc: loc(sourceFile, node),
    };
    if (assertion.assertionType === 'snapshot') {
      const { snapshotName } = assertion;
      const start = node.getStart();
      const fix = (): TSESLint.RuleFix => {
        let applied = false;
        return {
          range: [start, start],
          // Bug: previously, ESLint would only read RuleFix objects if `--fix` is passed. Now it seems to no matter what.
          // TODO: See if we can only update snapshots if `--fix` is passed?
          // See: https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues/14
          get text() {
            if (!applied) {
              // Make sure we update snapshot only on first read of this object
              applied = true;
              if (!options.disableExpectTypeSnapshotFix) {
                updateTypeSnapshot(fileName, snapshotName, actual);
              }
            }
            return '';
          },
        };
      };

      if (typeof assertion.expected === 'undefined') {
        context.report({
          ...templateDescriptor,
          messageId: 'TypeSnapshotNotFound',
          fix,
        });
      } else {
        context.report({
          ...templateDescriptor,
          messageId: 'TypeSnapshotDoNotMatch',
          fix,
        });
      }
    } else {
      context.report({
        ...templateDescriptor,
        messageId: 'TypesDoNotMatch',
        /*
        ...(assertion.assertionType === 'twoslash'
          ? {
              fix: (): TSESLint.RuleFix => {
                return {
                  range: assertion.expectedRange,
                  text: actual,
                };
              },
            }
          : {}),
        */
      });
    }
  }
  for (const line of unusedAssertions) {
    context.report({
      messageId: 'OrphanAssertion',
      loc: {
        line: line + 1,
        column: 0,
      },
    });
  }

  function diagnosticShouldBeIgnored(diagnostic: ts.Diagnostic) {
    const messageText =
      typeof diagnostic.messageText === 'string' ? diagnostic.messageText : diagnostic.messageText.messageText;
    return /'.+' is declared but (never used|its value is never read)./.test(messageText);
  }

  function addDiagnosticFailure(diagnostic: ts.Diagnostic): void {
    if (diagnosticShouldBeIgnored(diagnostic)) {
      return;
    }

    if (diagnostic.file === sourceFile) {
      const message = `${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`;
      context.report({
        messageId: 'TypeScriptCompileError',
        data: {
          message,
        },
        loc: {
          line: diagnostic.start! + 1,
          column: diagnostic.length!,
        },
      });
    } else {
      context.report({
        messageId: 'TypeScriptCompileError',
        data: {
          message: `${fileName}${diagnostic.messageText}`,
        },
        loc: {
          line: 1,
          column: 0,
        },
      });
    }
  }
}

interface TwoSlashAssertion {
  position: number;
  expected: string;
  expectedRange: [number, number];
  expectedPrefix: string;
}

type Assertion =
  | ({ readonly assertionType: 'twoslash' } & TwoSlashAssertion)
  | { readonly assertionType: 'manual'; expected: string }
  | {
      readonly assertionType: 'snapshot';
      expected?: string;
      readonly snapshotName: string;
    };

interface SyntaxError {
  readonly type: 'MissingSnapshotName' | 'MissingExpectType';
  readonly line: number;
}

interface Assertions {
  /** Lines with an $ExpectError. */
  readonly errorLines: ReadonlySet<number>;
  /** Map from a line number to the expected type at that line. */
  readonly typeAssertions: Map<number, Assertion>;
  /** Lines with more than one assertion (these are errors). */
  readonly duplicates: ReadonlyArray<number>;
  /** Twoslash-style type assertions in the file */
  readonly twoSlashAssertions: readonly TwoSlashAssertion[];
  /** Syntax Errors */
  readonly syntaxErrors: ReadonlyArray<SyntaxError>;
}

function parseAssertions(sourceFile: ts.SourceFile): Assertions {
  const errorLines = new Set<number>();
  const typeAssertions = new Map<number, Assertion>();
  const duplicates: number[] = [];
  const syntaxErrors: SyntaxError[] = [];
  const twoSlashAssertions: TwoSlashAssertion[] = [];

  const { text } = sourceFile;
  const commentRegexp = /\/\/(.*)/g;
  const lineStarts = sourceFile.getLineStarts();
  let curLine = 0;

  while (true) {
    const commentMatch = commentRegexp.exec(text);
    if (commentMatch === null) {
      break;
    }
    // Match on the contents of that comment so we do nothing in a commented-out assertion,
    // i.e. `// foo; // $ExpectType number`
    const match = /^( *)(?:(\$Expect(?:TypeSnapshot|Type|Error))|(\^\?))(?: (.*))?$/.exec(commentMatch[1]) as
      | [never, string, '$ExpectTypeSnapshot' | '$ExpectType' | '$ExpectError' | undefined, '^?' | undefined, string?]
      | null;
    if (match === null) {
      continue;
    }
    const commentCol = commentMatch.index;
    const line = getLine(commentCol);
    const whitespace = match[1];
    const directive = match[2] ?? match[3];
    const payload = match[4];
    switch (directive) {
      case '$ExpectTypeSnapshot':
        const snapshotName = payload;
        if (snapshotName) {
          if (typeAssertions.delete(line)) {
            duplicates.push(line);
          } else {
            typeAssertions.set(line, {
              assertionType: 'snapshot',
              snapshotName,
            });
          }
        } else {
          syntaxErrors.push({
            type: 'MissingSnapshotName',
            line,
          });
        }
        break;

      case '$ExpectError':
        if (errorLines.has(line)) {
          duplicates.push(line);
        }
        errorLines.add(line);
        break;

      case '$ExpectType': {
        const expected = payload;
        if (expected) {
          // Don't bother with the assertion if there are 2 assertions on 1 line. Just fail for the duplicate.
          if (typeAssertions.delete(line)) {
            duplicates.push(line);
          } else {
            typeAssertions.set(line, { assertionType: 'manual', expected });
          }
        } else {
          syntaxErrors.push({
            type: 'MissingExpectType',
            line,
          });
        }
        break;
      }

      case '^?': {
        // TODO: match error checking from ExpectType
        let expected = payload;
        if (expected) {
          // // ^?
          // 01234 <-- so add three... but also subtract 1?
          const position = commentCol - lineStarts[line - 1] + lineStarts[line - 2] + whitespace.length + 2;

          const expectedRange: [number, number] = [commentCol + whitespace.length + 5, lineStarts[line] - 1];
          // Peak ahead to the next lines to see if the expected type continues
          const expectedPrefix = text.slice(lineStarts[line - 1], commentCol + 2 + whitespace.length);
          for (let nextLine = line; nextLine < lineStarts.length; nextLine++) {
            const thisLineEnd = nextLine + 1 < lineStarts.length ? lineStarts[nextLine + 1] - 1 : text.length;
            const lineText = text.slice(lineStarts[nextLine], thisLineEnd + 1);
            if (lineText.startsWith(expectedPrefix)) {
              if (nextLine === line) {
                expected += '\n';
              }
              expected += lineText.slice(expectedPrefix.length);
              expectedRange[1] = thisLineEnd;
            } else {
              break;
            }
          }

          twoSlashAssertions.push({ position, expected, expectedRange, expectedPrefix });
        }
        break;
      }
    }
  }

  return { errorLines, typeAssertions, duplicates, twoSlashAssertions, syntaxErrors };

  function getLine(pos: number): number {
    // advance curLine to be the line preceding 'pos'
    while (lineStarts[curLine + 1] <= pos) {
      curLine++;
    }
    // If this is the first token on the line, it applies to the next line.
    // Otherwise, it applies to the text to the left of it.
    return isFirstOnLine(text, lineStarts[curLine], pos) ? curLine + 1 : curLine;
  }
}

function isFirstOnLine(text: string, lineStart: number, pos: number): boolean {
  for (let i = lineStart; i < pos; i++) {
    if (text[i] !== ' ') {
      return false;
    }
  }
  return true;
}

interface UnmetExpectation {
  assertion: Assertion;
  node: ts.Node;
  actual: string;
}

interface ExpectTypeFailures {
  /** Lines with an $ExpectType, but a different type was there. */
  readonly unmetExpectations: readonly UnmetExpectation[];
  /** Lines with an $ExpectType, but no node could be found. */
  readonly unusedAssertions: Iterable<number>;
}

function matchReadonlyArray(actual: string, expected: string) {
  if (!(/\breadonly\b/.test(actual) && /\bReadonlyArray\b/.test(expected))) return false;
  const readonlyArrayRegExp = /\bReadonlyArray</y;
  const readonlyModifierRegExp = /\breadonly /y;

  // A<ReadonlyArray<B<ReadonlyArray<C>>>>
  // A<readonly B<readonly C[]>[]>

  let expectedPos = 0;
  let actualPos = 0;
  let depth = 0;
  while (expectedPos < expected.length && actualPos < actual.length) {
    const expectedChar = expected.charAt(expectedPos);
    const actualChar = actual.charAt(actualPos);
    if (expectedChar === actualChar) {
      expectedPos++;
      actualPos++;
      continue;
    }

    // check for end of readonly array
    if (
      depth > 0 &&
      expectedChar === '>' &&
      actualChar === '[' &&
      actualPos < actual.length - 1 &&
      actual.charAt(actualPos + 1) === ']'
    ) {
      depth--;
      expectedPos++;
      actualPos += 2;
      continue;
    }

    // check for start of readonly array
    readonlyArrayRegExp.lastIndex = expectedPos;
    readonlyModifierRegExp.lastIndex = actualPos;
    if (readonlyArrayRegExp.test(expected) && readonlyModifierRegExp.test(actual)) {
      depth++;
      expectedPos += 14; // "ReadonlyArray<".length;
      actualPos += 9; // "readonly ".length;
      continue;
    }

    return false;
  }

  return true;
}

function getLanguageServiceHost(program: ts.Program): ts.LanguageServiceHost {
  return {
    getCompilationSettings: () => program.getCompilerOptions(),
    getCurrentDirectory: () => program.getCurrentDirectory(),
    getDefaultLibFileName: () => 'lib.d.ts',
    getScriptFileNames: () => program.getSourceFiles().map((sourceFile) => sourceFile.fileName),
    getScriptSnapshot: (name) => ts.ScriptSnapshot.fromString(program.getSourceFile(name)?.text ?? ''),
    getScriptVersion: () => '1',
  };
}

function getExpectTypeFailures(
  sourceFile: ts.SourceFile,
  assertions: Pick<Assertions, 'typeAssertions' | 'twoSlashAssertions'>,
  checker: ts.TypeChecker,
  languageService: ts.LanguageService,
): ExpectTypeFailures {
  const { typeAssertions, twoSlashAssertions } = assertions;

  const unmetExpectations: UnmetExpectation[] = [];
  // Match assertions to the first node that appears on the line they apply to.
  // `forEachChild` isn't available as a method in older TypeScript versions, so must use `ts.forEachChild` instead.
  ts.forEachChild(sourceFile, function iterate(node) {
    const line = lineOfPosition(node.getStart(sourceFile), sourceFile);
    const assertion = typeAssertions.get(line);
    if (assertion !== undefined) {
      const { expected } = assertion;

      let nodeToCheck = node;

      // https://github.com/Microsoft/TypeScript/issues/14077
      if (node.kind === ts.SyntaxKind.ExpressionStatement) {
        node = (node as ts.ExpressionStatement).expression;
      }
      nodeToCheck = getNodeForExpectType(node);
      const type = checker.getTypeAtLocation(nodeToCheck);
      const actual = type
        ? checker.typeToString(type, /*enclosingDeclaration*/ undefined, ts.TypeFormatFlags.NoTruncation)
        : '';

      if (!expected || (actual !== expected && !matchReadonlyArray(actual, expected))) {
        unmetExpectations.push({ assertion, node, actual });
      }

      typeAssertions.delete(line);
    }

    ts.forEachChild(node, iterate);
  });

  const twoSlashFailureLines: number[] = [];
  if (twoSlashAssertions.length) {
    for (const assertion of twoSlashAssertions) {
      const { position, expected } = assertion;
      const node = getNodeAtPosition(sourceFile, position);
      if (!node) {
        twoSlashFailureLines.push(sourceFile.getLineAndCharacterOfPosition(position).line);
        continue;
      }

      const qi = languageService.getQuickInfoAtPosition(sourceFile.fileName, node.getStart());
      if (!qi || !qi.displayParts) {
        unmetExpectations.push({
          assertion: { assertionType: 'twoslash', ...assertion },
          node,
          actual: '(Unable to get quickinfo)',
        });
        continue;
      }
      const actual = qi.displayParts.map((dp) => dp.text).join('');
      if (!matchModuloWhitespace(actual, expected)) {
        unmetExpectations.push({ assertion: { assertionType: 'twoslash', ...assertion }, node, actual });
      }
    }
  }

  return { unmetExpectations, unusedAssertions: [...twoSlashFailureLines, ...typeAssertions.keys()] };
}

function getNodeAtPosition(sourceFile: ts.SourceFile, position: number): ts.Node | null {
  let candidate: ts.Node | null = null;
  ts.forEachChild(sourceFile, function iterate(node) {
    const start = node.getStart();
    const end = node.getEnd();
    if (position >= start && position <= end) {
      candidate = node;
      ts.forEachChild(node, iterate);
    }
  });
  return candidate;
}

function matchModuloWhitespace(actual: string, expected: string): boolean {
  // TODO: it's much easier to normalize actual based on the displayParts
  const normActual = actual.replace(/[\n ]+/g, ' ');
  // console.log(actual, normActual);
  const normExpected = expected.replace(/[\n ]+/g, ' ');
  return normActual === normExpected;
}

function getNodeForExpectType(node: ts.Node): ts.Node {
  if (node.kind === ts.SyntaxKind.VariableStatement) {
    // ts2.0 doesn't have `isVariableStatement`
    const {
      declarationList: { declarations },
    } = node as ts.VariableStatement;
    if (declarations.length === 1) {
      const { initializer } = declarations[0];
      if (initializer) {
        return initializer;
      }
    }
  }
  return node;
}

function lineOfPosition(pos: number, sourceFile: ts.SourceFile): number {
  return sourceFile.getLineAndCharacterOfPosition(pos).line;
}
