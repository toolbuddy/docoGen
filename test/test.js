var docogen = require('../main');
/* const jsfs = require('jsonfile'); */

var t = docogen.generate_latexpdf(__dirname,__dirname+"/dest",{ output: "docogen-latex" },(err,msg)=>{
    console.log(msg);
});

// For utils module usage, export to another docoGen module to use
docogen.utils.strip_latex_format("\\[ x^n + y^n = z^n \\]","\\[","\\]");

/*
var t1 = docogen.generate_mdpdf(__dirname,__dirname+"/dest",{ output: "docogen-md" },(err,msg)=>{
    console.log(msg);
});

// extend 
docogen.merge_docogen_ex(__dirname,{},(err,docObj)=>{
    // here comes a merged json format from those docogen files under `__dirname`(e.g. your project directory)
    console.dir(docObj);
	var file = 'data.json'
	 
	jsfs.writeFile(file, docObj, {spaces: 2},function (err) {
	  console.error(err)
	})
});

// extend version: with promise support 
docogen.merge_docogen_ex_promise(__dirname,{})
    .then((result,error) => {
        // error 
        if(error) console.log(error)
        else{
            // information 
            console.log(`Message from merge process: ${result.msg}`)
            // json object of promise 
            console.dir(result.obj)
        }
    })*/