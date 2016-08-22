/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module retext:words
 * @fileoverview Check phrases for simpler alternatives.
 */

'use strict';

/* Dependencies. */
var keys = require('object-keys');
var difference = require('lodash.difference');
var nlcstToString = require('nlcst-to-string');
var quotation = require('quotation');
var search = require('nlcst-search');

/* Expose. */
module.exports = words;

/**
 * Attacher.
 *
 * @param {Retext} processor
 *   - Instance.
 * @param {Object?} [options]
 *   - Configuration.
 * @param {Array.<object>} [options.patterns]
 *   - List of patterns to search, and suggested replacements or omisisons.
 * @param {Array.<string>?} [options.ignore]
 *   - List of phrases to *not* warn about.
 * @return {Function} - `transformer`.
 */
function words(processor, options) {
  var patterns = (options || {}).patterns || {};
  var ignore = (options || {}).ignore || [];
  var phrases = difference(keys(patterns), ignore);

  return transformer;

  /**
   * Search `tree` for validations.
   *
   * @param {Node} tree - NLCST node.
   * @param {VFile} file - Virtual file.
   */
  function transformer(tree, file) {
    search(tree, phrases, function (match, position, parent, phrase) {
      var pattern = patterns[phrase];
      var replace = [].concat(pattern.replace || []);
      var value = quotation(nlcstToString(match), '“', '”');
      var message;

      if (pattern.caseSensitive && nlcstToString(match) !== phrase) {
        return;
      }

      if (pattern.omit && !replace.length) {
        message = 'Remove ' + value;
      } else {
        message = 'Replace ' + value + ' with ' + quotation(replace, '“', '”').join(', ');

        if (pattern.omit) {
          message += ', or remove it';
        }
      }

      message = file.warn(message, {
        start: match[0].position.start,
        end: match[match.length - 1].position.end
      });

      message.ruleId = phrase.replace(/\s+/g, '-').toLowerCase();
      message.source = 'retext-words';
    });
  }
}
