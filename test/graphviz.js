const docogen = require('../main')

docogen.gviz.drawRaw('digraph G {\n\
    \tone -> two;\n\
    \tone -> three;\n\
    \tone -> four;\
    \n}\n', {} , (err,msg) => {
        if(err)
            console.log(msg)
        else{
            console.log(`Temp file: ${msg.tmpf}\nResult image: ${msg.result}\n\n`)
        }
    });

docogen.gviz.drawFile('dotfile/graphviz.dot',{},(err,msg) => {
    if(err)
        console.log(msg)
    else{
        console.log(`Result image: ${msg.result}\n\n`)
    }
});