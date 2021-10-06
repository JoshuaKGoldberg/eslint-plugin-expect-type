import dedent from 'dedent';
import { RuleTester, Rule } from 'eslint';
import { typescript } from '../helpers/configs';
import { InvalidTestCase, processInvalidTestCase, processValidTestCase, ValidTestCase } from '../helpers/util';
import { name, rule } from '../../src/rules/expect';

// Valid test cases.
const valid: ReadonlyArray<ValidTestCase> = [
  // Primitive type
  {
    code: dedent`
      // $ExpectType number
      const t = 6 as number;
    `,
    optionsSet: [[]],
  },
  // Complex type
  {
    code: dedent`
      // $ExpectType { a: number; b: "on"; }
      const t = { a: 17, b: 'on' as const };
    `,
    optionsSet: [[]],
  },
  // Ignored TypeScript compiler complaints
  {
    code: dedent`
      function hasUnusedParam(unusedParam: number, implicitAnyParam) {
        const unusedLocal = 0;
        return implicitAnyParam;
      }
    `,
    optionsSet: [[]],
  },
];

// Invalid test cases.
const invalid: ReadonlyArray<InvalidTestCase> = [
  {
    code: dedent`
      // $ExpectType number
      const t = 'a';
    `,
    optionsSet: [[]],
    errors: [
      {
        messageId: 'TypesDoNotMatch',
        line: 2,
        column: 1,
      },
    ],
  },
  {
    code: dedent`
      //$ExpectType number
      const t = 'a';
    `,
    optionsSet: [[]],
    errors: [
      {
        messageId: 'TypesDoNotMatch',
        line: 2,
        column: 1,
      },
    ],
  },
  // Complex type - historically (https://github.com/microsoft/TypeScript/issues/9879), dtslint and eslint type comparison fails here
  {
    code: dedent`
      // $ExpectType { a: number; b: "on"; }
      const t = { b: 'on' as const, a: 17 };
    `,
    optionsSet: [[]],
    errors: [
      {
        messageId: 'TypesDoNotMatch',
        line: 2,
        column: 1,
      },
    ],
  },
];

describe('$ExpectType', () => {
  const ruleTester = new RuleTester(typescript);
  ruleTester.run(name, rule as unknown as Rule.RuleModule, {
    valid: processValidTestCase(valid),
    invalid: processInvalidTestCase(invalid),
  });
});
