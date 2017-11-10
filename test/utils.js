var docogen = require('../main');

// For utils module usage, export to another docoGen module to use
docogen.utils.strip_latex_format("\\[ x^n + y^n = z^n \\]","\\[","\\]");
