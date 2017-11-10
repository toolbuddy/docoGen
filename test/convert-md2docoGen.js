var docogen = require('../main');

// Convert to docoGen Script
console.log(`Get docoGen script:\n ${JSON.stringify(docogen.md2docogen('md-script/example.md'))}`);