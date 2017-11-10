var docogen = require('../main');
var jsfs = require('jsonfile');

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
    })