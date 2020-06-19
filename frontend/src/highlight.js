var hljs = require('../node_modules/highlight.js/lib/core');
hljs.registerLanguage('go', require('../node_modules/highlight.js/lib/languages/go'));
module.exports = hljs;
