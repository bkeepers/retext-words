/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module retext:intensify
 * @fileoverview Test suite for `retext-words`.
 */

'use strict';

/* Dependencies. */
var test = require('tape');
var retext = require('retext');
var words = require('./');
var patterns = {
  "utilize": { replace: "use" },
  "be advised": { omit: true },
  "appropriate": { replace: [ "proper", "right" ], omit: true },
}

/* Tests. */
test('words', function (t) {
  t.plan(4);

  retext()
    .use(words, {patterns: patterns})
    .process([
      'You can utilize a shorter word.',
      'Be advised, don’t do this.',
      'That’s the appropriate thing to do.'
    ].join('\n'), function (err, file) {
      t.ifError(err, 'should not fail (#1)');

      t.deepEqual(
        file.messages.map(String),
        [
          '1:9-1:16: Replace “utilize” with “use”',
          '2:1-2:11: Remove “Be advised”',
          '3:12-3:23: Replace “appropriate” with “proper”, ' +
          '“right”, or remove it'
        ],
        'should warn about replacements'
      );
    });

  retext()
    .use(words, {patterns: patterns, ignore: ['utilize']})
    .process([
      'You can utilize a shorter word.',
      'Be advised, don’t do this.',
      'That’s the appropriate thing to do.'
    ].join('\n'), function (err, file) {
      t.ifError(err, 'should not fail (#2)');

      t.deepEqual(
        file.messages.map(String),
        [
          '2:1-2:11: Remove “Be advised”',
          '3:12-3:23: Replace “appropriate” with “proper”, ' +
          '“right”, or remove it'
        ],
        'should not warn for `ignore`d phrases'
      );
    });
});
