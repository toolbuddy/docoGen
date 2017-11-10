var docogen = require('../main');

docogen.generate_mdpdf(__dirname,__dirname+"/dest",{ output: "docogen-md" },(err,msg)=>{
    console.log(msg);
});