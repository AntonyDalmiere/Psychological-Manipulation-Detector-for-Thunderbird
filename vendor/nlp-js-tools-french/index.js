'use strict';

/*
 * Trimmed subset of nlp-js-tools-french 1.0.9.
 *
 * Only the French Snowball stemmer is retained. The POS tagger, the lemmatizer
 * and the nine bundled dictionaries are not used by this add-on and have been
 * removed, which also removes the lodash dependency (it was only reachable
 * through algos/find-tokens.js -> helpers.js).
 *
 * See NOTICE.md for the list of changes.
 */

var Config = require('./config');
var Logger = require('./logger');
var Tokenize = require('./algos/tokenize');
var StemTools = require('./algos/stem');

module.exports = NlpjsTFr;

function NlpjsTFr(sentence, userConfig) {

    this.config = new Config(userConfig);
    this.logger = new Logger(this.config);

    this.logger.debug("Config: ", this.config);

    this.sentence = sentence;
    this.tokenized = Tokenize(this);
    this.stemmed = null;

    this.stemmer = function() {
        this.stemmed = StemTools.stem(this);
        this.logger.debug("Stemmed: ", this.stemmed);
        return this.stemmed;
    };

    this.wordStemmer = function(word) {
        var stemmedWord = StemTools.stemWord(word);
        this.logger.debug("StemmedWord: ", stemmedWord);
        return stemmedWord;
    };

}
