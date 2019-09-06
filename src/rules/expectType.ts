import { createRule } from '../util';
import { RuleContext } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import * as ts from 'typescript';
import { basename, dirname, join, resolve as resolvePath } from 'path';
import { existsSync, readFileSync } from 'fs';
import { isContext } from 'vm';

const FAILURE_STRING_DUPLICATE_ASSERTION =
  'This line has 2 $ExpectType assertions.';
const FAILURE_STRING_ASSERTION_MISSING_NODE =
  'Can not match a node to this assertion.';
const FAILURE_STRING_EXPECTED_ERROR =
  'Expected an error on this line, but found none.';

const FAILURE_STRING = (expectedType: string, actualType: string) => {
  return `Expected type to be:\n  ${expectedType}\ngot:\n  ${actualType}`;
};

const messages = {
  errorFileNotFound: 'Expected to find a file "{{ fileName }}" present.',
  failureAtNode: '{{ message }}',
};
type MessageIds = keyof typeof messages;

export const expectType = createRule<[], MessageIds>({
  name: 'expect-type',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallows the delete operator',
      category: 'Possible Errors',
      recommended: 'error',
      requiresTypeChecking: false,
    },
    schema: [],
    messages,
  },
  defaultOptions: [],
  create(context) {
    const { project } = context.parserOptions;
    if (!project) {
      throw new Error('project isnt configured!');
    }

    const projects = Array.isArray(project) ? project : [project];
    for (const project of projects) {
      getFailures(context, project);
    }

    return {};
  },
});

const getFailures = (
  context: RuleContext<MessageIds, []>,
  tsconfigPath: string,
) => {
  const program = createProgram(tsconfigPath);
  walk(context, program);
  return;
};

function createProgram(configFile: string): ts.Program {
  const projectDirectory = dirname(configFile);
  const { config } = ts.readConfigFile(configFile, ts.sys.readFile);
  const parseConfigHost: ts.ParseConfigHost = {
    fileExists: existsSync,
    readDirectory: ts.sys.readDirectory,
    readFile: file => readFileSync(file, 'utf8'),
    useCaseSensitiveFileNames: true,
  };
  const parsed = ts.parseJsonConfigFileContent(
    config,
    parseConfigHost,
    resolvePath(projectDirectory),
    { noEmit: true },
  );
  const host = ts.createCompilerHost(parsed.options, true);
  return ts.createProgram(parsed.fileNames, parsed.options, host);
}

function walk(ctx: RuleContext<MessageIds, []>, program: ts.Program): void {
  const addFailureAtNode = (node: ts.Node, message: string) => {
    const getLOC = (node: ts.Node) => {
      const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
      return ({
        start: {
          line: start.line + 1,
          column: start.character,
        },
        end: {
          line: end.line + 1,
          column: end.character,
        }
      })
    };
    ctx.report({
      messageId: 'failureAtNode',
      data: {
        message,
      },
      loc: getLOC(node),
    })
    // node.getEnd
    // console.log('failureAtNode', message);
  };
  const addFailure = (start: number, stop: number, message: string) => {
    console.log('failure', start, stop, message);
  };
  const addFailureAt = (start: number, stop: number, message: string) => {
    console.log('failureAt', start, stop, message);
  };
  const fileName = ctx.getFilename();
  const sourceFile = program.getSourceFile(fileName)!;
  if (!sourceFile) {
    ctx.report({
      loc: {
        line: 1,
        column: 0,
      },
      messageId: 'errorFileNotFound',
      data: {
        fileName,
      },
    });
    // console.log(`Expected to find a file '${fileName}' present.`);
    return;
  }

  const checker = program.getTypeChecker();
  // Don't care about emit errors.
  const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
  if (
    sourceFile.isDeclarationFile ||
    !/\$Expect(Type|Error)/.test(sourceFile.text)
  ) {
    // Normal file.
    for (const diagnostic of diagnostics) {
      addDiagnosticFailure(diagnostic);
    }
    return;
  }

  const { errorLines, typeAssertions, duplicates } = parseAssertions(
    sourceFile,
  );

  for (const line of duplicates) {
    addFailureAtLine(line, FAILURE_STRING_DUPLICATE_ASSERTION);
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
      addFailureAtLine(line, FAILURE_STRING_EXPECTED_ERROR);
    }
  }

  const { unmetExpectations, unusedAssertions } = getExpectTypeFailures(
    sourceFile,
    typeAssertions,
    checker,
  );
  for (const { node, expected, actual } of unmetExpectations) {
    addFailureAtNode(node, FAILURE_STRING(expected, actual));
  }
  for (const line of unusedAssertions) {
    addFailureAtLine(line, FAILURE_STRING_ASSERTION_MISSING_NODE);
  }

  function addDiagnosticFailure(diagnostic: ts.Diagnostic): void {
    const intro = getIntro();
    if (diagnostic.file === sourceFile) {
      const msg = `${intro}\n${ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n',
      )}`;
      addFailureAt(diagnostic.start!, diagnostic.length!, msg);
    } else {
      addFailureAt(0, 0, `${intro}\n${fileName}${diagnostic.messageText}`);
    }
  }

  function getIntro(): string {
    return `TypeScript compile error: `;
  }

  function addFailureAtLine(line: number, failure: string): void {
    const start = sourceFile.getPositionOfLineAndCharacter(line, 0);
    let end = start + sourceFile.text.split('\n')[line].length;
    if (sourceFile.text[end - 1] === '\r') {
      end--;
    }
    addFailure(start, end, `TypeScript: ${failure}`);
  }
}

interface Assertions {
  /** Lines with an $ExpectError. */
  readonly errorLines: ReadonlySet<number>;
  /** Map from a line number to the expected type at that line. */
  readonly typeAssertions: Map<number, string>;
  /** Lines with more than one assertion (these are errors). */
  readonly duplicates: ReadonlyArray<number>;
}

function parseAssertions(sourceFile: ts.SourceFile): Assertions {
  const errorLines = new Set<number>();
  const typeAssertions = new Map<number, string>();
  const duplicates: number[] = [];

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
    const match = /^ \$Expect((Type (.*))|Error)$/.exec(commentMatch[1]);
    if (match === null) {
      continue;
    }
    const line = getLine(commentMatch.index);
    if (match[1] === 'Error') {
      if (errorLines.has(line)) {
        duplicates.push(line);
      }
      errorLines.add(line);
    } else {
      const expectedType = match[3];
      // Don't bother with the assertion if there are 2 assertions on 1 line. Just fail for the duplicate.
      if (typeAssertions.delete(line)) {
        duplicates.push(line);
      } else {
        typeAssertions.set(line, expectedType);
      }
    }
  }

  return { errorLines, typeAssertions, duplicates };

  function getLine(pos: number): number {
    // advance curLine to be the line preceding 'pos'
    while (lineStarts[curLine + 1] <= pos) {
      curLine++;
    }
    // If this is the first token on the line, it applies to the next line.
    // Otherwise, it applies to the text to the left of it.
    return isFirstOnLine(text, lineStarts[curLine], pos)
      ? curLine + 1
      : curLine;
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

interface ExpectTypeFailures {
  /** Lines with an $ExpectType, but a different type was there. */
  readonly unmetExpectations: ReadonlyArray<{
    node: ts.Node;
    expected: string;
    actual: string;
  }>;
  /** Lines with an $ExpectType, but no node could be found. */
  readonly unusedAssertions: Iterable<number>;
}

function matchReadonlyArray(actual: string, expected: string) {
  if (!(/\breadonly\b/.test(actual) && /\bReadonlyArray\b/.test(expected)))
    return false;
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
    if (
      readonlyArrayRegExp.test(expected) &&
      readonlyModifierRegExp.test(actual)
    ) {
      depth++;
      expectedPos += 14; // "ReadonlyArray<".length;
      actualPos += 9; // "readonly ".length;
      continue;
    }

    return false;
  }

  return true;
}

function getExpectTypeFailures(
  sourceFile: ts.SourceFile,
  typeAssertions: Map<number, string>,
  checker: ts.TypeChecker,
): ExpectTypeFailures {
  const unmetExpectations: Array<{
    node: ts.Node;
    expected: string;
    actual: string;
  }> = [];
  // Match assertions to the first node that appears on the line they apply to.
  // `forEachChild` isn't available as a method in older TypeScript versions, so must use `ts.forEachChild` instead.
  ts.forEachChild(sourceFile, function iterate(node) {
    const line = lineOfPosition(node.getStart(sourceFile), sourceFile);
    const expected = typeAssertions.get(line);
    if (expected !== undefined) {
      // https://github.com/Microsoft/TypeScript/issues/14077
      if (node.kind === ts.SyntaxKind.ExpressionStatement) {
        node = (node as ts.ExpressionStatement).expression;
      }

      const type = checker.getTypeAtLocation(getNodeForExpectType(node));

      const actual = type
        ? checker.typeToString(
            type,
            /*enclosingDeclaration*/ undefined,
            ts.TypeFormatFlags.NoTruncation,
          )
        : '';

      if (actual !== expected && !matchReadonlyArray(actual, expected)) {
        unmetExpectations.push({ node, expected, actual });
      }

      typeAssertions.delete(line);
    }

    ts.forEachChild(node, iterate);
  });
  return { unmetExpectations, unusedAssertions: typeAssertions.keys() };
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
