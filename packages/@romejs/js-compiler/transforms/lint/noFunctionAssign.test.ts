/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import test from '@romejs/test';
import {testLint} from '../../api/lint.test';
import {Diagnostic} from '@romejs/diagnostics/types';

test('no function reassignment', async (t) => {
  function checkCategory(diagnostic: Diagnostic): Boolean {
    return diagnostic.description.category === 'lint/noFunctionAssign';
  }

  const validTestCases = [
    'function foo() { var foo = bar; }',
    'function foo(foo) { foo = bar; }',
    'function foo() { var foo; foo = bar; }',
    'var foo = () => {}; foo = bar;',
    'var foo = function() {}; foo = bar;',
    'var foo = function() { foo = bar; };',
    `import bar from 'bar'; function foo() { var foo = bar; }`,
  ];

  const invalidTestCases = [
    'function foo() {}; foo = bar;',
    'function foo() { foo = bar; }',
    'foo = bar; function foo() { };',
    '[foo] = bar; function foo() { };',
    '({x: foo = 0} = bar); function foo() { };',
    'function foo() { [foo] = bar; }',
    '(function() { ({x: foo = 0} = bar); function foo() { }; })();',
  ];

  for (const testCase of validTestCases) {
    const {diagnostics} = await testLint(testCase);
    t.falsy(diagnostics.find(checkCategory));
  }

  for (const testCase of invalidTestCases) {
    const {diagnostics} = await testLint(testCase);
    t.truthy(diagnostics.find(checkCategory));
  }
});
