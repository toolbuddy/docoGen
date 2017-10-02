var docogen = require('../main');

var t = docogen.generate_latexpdf(__dirname,__dirname+"/dest",{ output: "docogen-latex" },(err,msg)=>{
    console.log(msg);
});

var t1 = docogen.generate_mdpdf(__dirname,__dirname+"/dest",{ output: "docogen-md" },(err,msg)=>{
    console.log(msg);
});