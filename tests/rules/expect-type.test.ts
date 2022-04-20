import dedent from 'dedent';
import { filename, filenameDts, runRuleTests } from '../helpers/configs';

// Valid test cases.
runRuleTests({
  valid: [
    // Primitive type
    {
      code: dedent`
      // $ExpectType number
      const t = 6 as number;
    `,
      filename,
      options: [],
    },
    // Complex type
    {
      code: dedent`
      // $ExpectType { a: number; b: "on"; }
      const t = { a: 17, b: 'on' as const };
    `,
      filename,
      options: [],
    },
    // Ignored TypeScript compiler complaints
    {
      code: dedent`
      function hasUnusedParam(unusedParam: number, implicitAnyParam) {
        const unusedLocal = 0;
        return implicitAnyParam;
      }
    `,
      filename,
      options: [],
    },
  ],
  invalid: [
    {
      code: dedent`
      // $ExpectType number
      const t = 'a';
    `,
      options: [],
      errors: [
        {
          messageId: 'TypesDoNotMatch',
          line: 2,
          column: 1,
        },
      ],
      filename,
    },
    {
      code: dedent`
      // $ExpectType number
      const t = 'a';
    `,
      options: [],
      errors: [
        {
          messageId: 'TypesDoNotMatch',
          line: 2,
          column: 1,
        },
      ],
      filename: filenameDts,
    },
    {
      code: dedent`
      //$ExpectType number
      const t = 'a';
    `,
      options: [],
      errors: [
        {
          messageId: 'TypesDoNotMatch',
          line: 2,
          column: 1,
        },
      ],
      filename,
    },
    // Complex type - historically (https://github.com/microsoft/TypeScript/issues/9879), dtslint and eslint type comparison fails here
    {
      code: dedent`
      // $ExpectType { a: number; b: "on"; }
      const t = { b: 'on' as const, a: 17 };
    `,
      options: [],
      errors: [
        {
          messageId: 'TypesDoNotMatch',
          line: 2,
          column: 1,
        },
      ],
      filename,
    },
  ],
});
