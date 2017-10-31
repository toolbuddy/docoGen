var docogen = require('docogen');
/* const jsfs = require('jsonfile'); */

var t = docogen.generate_latexpdf(__dirname,__dirname+"/dest",{ output: "docogen-latex" },(err,msg)=>{
    console.log(msg);
});
