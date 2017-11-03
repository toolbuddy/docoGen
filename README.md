# Docogen
[![npm version](https://badge.fury.io/js/docogen.svg)](https://badge.fury.io/js/docogen)
[![npm downloads](https://img.shields.io/npm/dm/docogen.svg)](https://img.shields.io/npm/dm/docogen.svg)
[![](https://data.jsdelivr.com/v1/package/npm/docogen/badge)](https://www.jsdelivr.com/package/npm/docogen)

A document generation tool within your masterpiece.
* The coverage :
   - [x] Convert to Latex pdf(latest support!)
   - [x] Convert to Markdown pdf(working)
   - [x] Convert to html(working)
      - using the module [`docoGen-html-ui`](https://github.com/toolbuddy/docoGen-html-ui)

# [Wiki](https://github.com/toolbuddy/docogen/wiki)
* Contain the latest support and usage explanation.
* Also the IDE support documentation!

# Prerequisite
* Dependencies of `node-latex-pdf`.
* Using the file extension which named `.docogen`, and just store json format in it.
  * these files treated as configuration dependency to your generated result.
  * More information (Still working on it, see `test/script/` to see current support)
* Within docogen running, `MikTex` will asked you to install multiple required package with docogen.
  * It will takes minutes to complete.

# Usage
* Git clone with submodule
```bash
git clone --recursive https://github.com/toolbuddy/docoGen.git
```

* Install
```bash
npm install docogen --save
```

* Import in your code
  * `src_path`: the source path to your project root, and it will get all docogen files.
  * `dest_path`: the destination directory to store those generated pdf.
  * `options`: the user-defined go here. (JSON object format)
    * `output`: specify the output pdf filename.
```js
const docogen = require('docogen');

// convert docogen to latex (pdf format), with absolute path
docogen.generate_latexpdf( src_path , dest_path , options ,(err,msg)=>{
    console.log(msg);
});

// convert docogen to markdown (pdf format), with absolute path
docogen.generate_mdpdf( src_path , dest_path , options ,(err,msg)=>{
    console.log(msg);
});

// merge all docogen and output a json object 
/* using file list (docogen) as merging source */
var returnObj = docogen.merge_docogen(file_list,{detail: true});

/* using directory path as merging source */
docogen.merge_docogen_ex(__dirname,{},(err,docObj)=>{
    // here comes a merged json format from those docogen files under `__dirname`(e.g. your project directory)
    console.dir(docObj);
	var file = 'data.json'
	 
	jsfs.writeFile(file, docObj, {spaces: 2},function (err) {
	  console.error(err)
	})
});
```

# Author
* Kevin Cyu, kevinbird61@gmail.com, [website](https://kevinbird61.github.io/Intro/)
