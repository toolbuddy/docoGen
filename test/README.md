# Support Method from docoGen

* Install
```bash
npm install docogen --save
```

* Import
```js
// Import docoGen library
const docogen = require('docogen');
```

## LaTeX 

###### see example in `latex-method.js`

* `docogen.generate_latexpdf(src,dest,options,cb)`
    * Generate LaTeX pdf from docoGen script
    * Parameters:
        * `src`: specified the directory(e.g. root directory of your project), and docoGen generator will collect all scripts under here.
        * `dest`: specified the destination, and the result(LaTeX pdf) will be stored in here.
        * `options`:
            * `output`: specified the output file name, otherwise it will be generated randomly from your source.
        * `cb`: callback function with 2 argument `(err,msg)`
            * `err`: 0 = error, 1 = success
            * `msg`: message of error/success
* `docogen.generate_latexpdf_raw(src,options,cb)`
    * Generate LaTeX pdf from json Object (with available docoGen format)
    * Parameters:
        * `src`: specified the markdown file path.(Absolutive path)
        * `options`:
            * `output`: specified the output file name, otherwise it will be generated randomly from your source file.
            * `dest`: specified the destination, and the result(LaTeX pdf) will be stored in here.
        * `cb`: callback function with 2 argument `(err,msg)`
            * `err`: 0 = error, 1 = success
            * `msg`: message of error/success

## Markdown 

###### see example in `convert-md2docoGen.js`

* `docogen.md2docogen(md_path)`
    * Convert markdown to docoGen format
    * `md_path`: specified the markdown source file and transform to **json Object** with docoGen format
    * Return a `Json Object` with ***docoGen format***

###### see example in `md-method.js`

* `docogen.generate_mdpdf(src,dest,options,cb)`
    * Generate Markdown pdf from docoGen script
    * (Still working on it...)
    * `src`: specified the directory(e.g. root directory of your project), and docoGen generator will collect all scripts under here.
    * `dest`: specified the destination, and the result(LaTeX pdf) will be stored in here.
    * `options`:
        * `output`: specified the output file name, otherwise it will be generated randomly from your source.
    * `cb`: callback function with 2 argument `(err,msg)`
        * `err`: 0 = success, 1 = error
        * `msg`: message of error/success

## Merge

* `docogen.merge_docogen(src_arr,options)`
    * Merge multiple docoGen scripts
        * Merging `article` fields together above all the docoGen scripts.
    * `src_arr`: array of files path
    * `options`:
        * `detail`: if `true`, merging process will print out each file path in `src_arr`
    * Return a `Json Object` with ***docoGen format***

###### see example in `promise-method.js`

* `docogen.merge_docogen_ex(src_path,options,cb)`
    * Merge multiple docoGen scripts by specified directory path
    * `src_path`: specified the root directory to collect `.docogen` scripts.
    * `options`: same as method `merge_docogen`
    * `cb`: with 2 argument `(err,obj)`
        * `err`: 0 => success, 1 = error
        * `obj`: merged json Object( same as return value of `merge_docogen` )

* `docogen.merge_docogen_ex_promise(src_path,options)`
    * Merge multiple docoGen scripts by specified directory path (promise)
    * Same as `merge_docogen_ex`
    * Return promise `{ msg, obj }`
        * `msg`: Message of merging process
        * `obj`: merged json Object( same as return value of `merge_docogen` )

## Utilities

###### see example in `utils.js`

* `docogen.utils.strip_latex_format(latex_str,delimiter_1,delimiter_2)`
    * strip out the LaTeX format string to normal one
    * *Basically be used when another docoGen module(ex: docoGen-WebUI) want to use the same scripts*
    * You can specified the delimiter by yourself to strip out additional LaTeX.
    * `latex_str`: input string with LaTeX format
    * `delimiter_1`, `delimiter_2`: specify the format we want to strip out
    * Return a normal string without LaTeX format.
