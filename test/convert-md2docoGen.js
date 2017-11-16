var docogen = require('../main'),
    jsfs = require('jsonfile');;

// Convert to docoGen Script
/*
// Print out stringified jsonObj
console.log(`Get docoGen script:\n ${JSON.stringify(docogen.md2docogen('md-script/example.md'))}`);
*/
// Write file
jsfs.writeFileSync('test.json',docogen.md2docogen('md-script/example.md'),{spaces: 4})

// Convert it!
/*
    md_path: need to use `__dirname` to get full file path (to do the resolve trick)
    options: {
        output: your latex output file name
        dest: your latex pdf result will be stored here
    }
*/
docogen.generate_latexpdf_raw(__dirname+'/md-script/example.md'
    ,{output: "docogen-latex-fromMD", dest: __dirname+"/dest"}
    ,(err,msg) => {
        console.log(msg)
    });