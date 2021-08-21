/**
 * @file Tests for $ExpectTypeSnapshot.
 */
import dedent from 'dedent';
import { RuleTester, Rule } from 'eslint';
import { typescript } from '../helpers/configs';
import { InvalidTestCase, processInvalidTestCase, processValidTestCase, ValidTestCase } from '../helpers/util';
import { name, rule } from '../../src/rules/expect';

// Valid test cases.
const valid: ReadonlyArray<ValidTestCase> = [
  // Snapshot matches.
  {
    code: dedent`
      // $ExpectTypeSnapshot SnapshotMatches
      const c = { a: 15, b: "b" as const, c: "c" };
    `,
    optionsSet: [[{ disableExpectTypeSnapshotFix: true }]],
  },
];

// Invalid test cases.
const invalid: ReadonlyArray<InvalidTestCase> = [
  // Snapshot name is not specified
  {
    code: dedent`
      // $ExpectTypeSnapshot
      const Button = class {};
    `,
    optionsSet: [[]],
    errors: [
      {
        messageId: 'SyntaxError',
        line: 2,
        column: 1,
      },
    ],
  },
  {
    code: dedent`
      //$ExpectTypeSnapshot
      const Button = class {};
    `,
    optionsSet: [[]],
    errors: [
      {
        messageId: 'SyntaxError',
        line: 2,
        column: 1,
      },
    ],
  },
  // Snapshot not found. Suggestion to run eslint --fix to create snapshot.
  {
    code: dedent`
      // $ExpectTypeSnapshot snapshot-not-found
      const configA = { a: 15, b: "b" as const, c: "c" };
    `,
    optionsSet: [[{ disableExpectTypeSnapshotFix: true }]],
    errors: [
      {
        messageId: 'TypeSnapshotNotFound',
        line: 2,
        column: 1,
      },
    ],
  },
  // Snapshot has different type.
  {
    code: dedent`
      // $ExpectTypeSnapshot TypeSnapshotDoNotMatch
      const configB = { a: 15, b: "b" as const, c: "c" };
    `,
    optionsSet: [[{ disableExpectTypeSnapshotFix: true }]],
    errors: [
      {
        messageId: 'TypeSnapshotDoNotMatch',
        line: 2,
        column: 1,
      },
    ],
  },
];

describe('$ExpectTypeSnapshot', () => {
  const ruleTester = new RuleTester(typescript);
  ruleTester.run(name, rule as Rule.RuleModule, {
    valid: processValidTestCase(valid),
    invalid: processInvalidTestCase(invalid),
  });
});
