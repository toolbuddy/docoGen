var docogen = require('../main');
/* const jsfs = require('jsonfile'); */

docogen.generate_latexpdf(__dirname,__dirname+"/dest",{ output: "docogen-latex" },(err,msg)=>{
    console.log(msg);
});