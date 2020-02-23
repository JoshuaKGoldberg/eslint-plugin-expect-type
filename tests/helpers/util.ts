import { TSESLint } from '@typescript-eslint/experimental-utils';
import { Rule, RuleTester as ESLintRuleTester } from 'eslint';
import { filename } from './configs';

type OptionsSet = {
  /**
   * The set of options this test case should pass for.
   */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly optionsSet: ReadonlyArray<any>;
};

export type ValidTestCase = Omit<ESLintRuleTester.ValidTestCase, 'options'> & OptionsSet;

export type InvalidTestCase = Omit<ESLintRuleTester.InvalidTestCase, 'options'> & OptionsSet;

/**
 * Convert our test cases into ones eslint test runner is expecting.
 */
export function processInvalidTestCase(
  testCases: Readonly<InvalidTestCase[]>,
): Array<ESLintRuleTester.InvalidTestCase> {
  return testCases.flatMap(testCase =>
    testCase.optionsSet.map(options => {
      const { optionsSet, ...eslintTestCase } = testCase;
      return {
        filename,
        ...eslintTestCase,
        options,
      };
    }),
  );
}

/**
 * Convert our test cases into ones eslint test runner is expecting.
 */
export function processValidTestCase(testCases: ReadonlyArray<ValidTestCase>): Array<ESLintRuleTester.ValidTestCase> {
  // Ideally these two functions should be merged into 1 but I haven't been able
  // to get the typing information right - so for now they are two functions.
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return processInvalidTestCase(testCases as any);
}

/**
 * Create a dummy rule for testing.
 */
export function createDummyRule(
  create: (
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    context: TSESLint.RuleContext<'generic', any>,
  ) => TSESLint.RuleListener,
): Rule.RuleModule {
  const meta: TSESLint.RuleMetaData<'generic'> = {
    type: 'suggestion',
    docs: {
      description: 'Disallow mutable variables.',
      category: 'Best Practices',
      recommended: 'error',
      url: '',
    },
    messages: {
      generic: 'Error.',
    },
    fixable: 'code',
    schema: {},
  };

  return {
    meta,
    create,
  } as Rule.RuleModule;
}

export type RuleTesterTests = {
  // eslint-disable-next-line functional/prefer-readonly-type
  valid?: Array<string | ESLintRuleTester.ValidTestCase>;
  // eslint-disable-next-line functional/prefer-readonly-type
  invalid?: Array<ESLintRuleTester.InvalidTestCase>;
};
