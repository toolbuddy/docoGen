# Docogen
A document generation tool within your masterpiece.
* The coverage :
   - [x] Convert to Latex
   - [x] Convert to pdf
   - [ ] Convert to html

# Prerequisite
* Dependencies of `node-latex-pdf`.
* Using the file extension which named `.docogen`, and just store json format in it.
  * these files treated as configuration dependency to your generated result.
  * More information (Still working on it, see `test/example.docogen` to see current support)

# Usage 
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
var t1 = docogen.generate_latexpdf( src_path , dest_path , options ,(err,msg)=>{
    console.log(msg);
});

// convert docogen to markdown (pdf format), with absolute path
var t2 = docogen.generate_mdpdf( src_path , dest_path , options ,(err,msg)=>{
    console.log(msg);
});
```

# Author
* Kevin Cyu, kevinbird61@gmail.com, [website](https://kevinbird61.github.io/Intro/)
