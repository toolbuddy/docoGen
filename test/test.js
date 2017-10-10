var docogen = require('../main');

var t = docogen.generate_latexpdf(__dirname,__dirname+"/dest",{ output: "docogen-latex" },(err,msg)=>{
    console.log(msg);
});

var t1 = docogen.generate_mdpdf(__dirname,__dirname+"/dest",{ output: "docogen-md" },(err,msg)=>{
    console.log(msg);
});

// extend 
docogen.merge_docogen_ex(__dirname,{},(err,docObj)=>{
    // here comes a merged json format from those docogen files under `__dirname`(e.g. your project directory)
    console.dir(docObj);
});