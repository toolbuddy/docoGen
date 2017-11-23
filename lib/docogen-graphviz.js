const exec = require('child_process').exec,
    rs = require('randomstring'),
    path = require('path'),
    fs = require('fs'),
    os = require('os');

const gviz = {};

/*
    Available graphviz type: 
        canon cmap cmapx cmapx_np dot eps fig gd gd2 
        gif gv imap imap_np ismap jpe jpeg jpg pdf pic 
        plain plain-ext png pov ps ps2 svg svgz tk vml 
        vmlz vrml wbmp x11 xdot xdot1.2 xdot1.4 xlib
*/

gviz.drawRaw = function(raw,option,cb){
    let tmp = 'drawFile-'+rs.generate(12).toString() ;
    option =  
        { 
            type : option.type || 'png',
            dest : option.dest || os.tmpdir(),
            output: option.output || tmp
        };
    let tmpf = tmp + '.dot'
    let tmpr = option.output + '.' + option.type
    // Write file
    fs.writeFile(path.join(option.dest,tmpf),raw,(err) => {
        if(err){
            cb(1,`Can't not write file in ${option.dest}\nPlease check out the permission or your input!`)
            //console.error(`Can't not write file in ${option.dest}\nPlease check out the permission or your input!`)
        }
        else{
            // detect os 
            if(os.type() == "Windows_NT"){
                // cb(1,`Currently not support graphviz function on ${os.type()}!`)
                //console.error(`Currently not support graphviz function on ${os.type()}!`)
                // Generate the result
                p = exec(`dot -T${option.type} ${path.join(option.dest,tmpf)} -o ${path.join(option.dest,tmpr)}`,(err,stdout,stderr) => {
                    
                    if(err){
                        cb(1,`Error: ${stderr}`)
                        //console.log(`Error: ${stderr}`)
                    }
                    else{
                        console.log(`Success!\nYour result has been stored in ${path.join(option.dest,tmpr)}\nAnd the source file is temporarily stored in ${path.join(os.tmpdir(),tmpf)}\n`)
                        cb(0,{ tmpf: path.join(option.dest,tmpf), result: path.join(option.dest,tmpr)})
                    }
                });
            }
            else if(os.type() == "Linux"){
                // Linux
                // Generate the result
                p = exec(`dot -T${option.type} ${path.join(option.dest,tmpf)} -o ${path.join(option.dest,tmpr)}`,(err,stdout,stderr) => {
                    
                    if(err){
                        cb(1,`Error: ${stderr}`)
                        //console.log(`Error: ${stderr}`)
                    }
                    else{
                        console.log(`Success!\nYour result has been stored in ${path.join(option.dest,tmpr)}\nAnd the source file is temporarily stored in ${path.join(os.tmpdir(),tmpf)}\n`)
                        cb(0,{ tmpf: path.join(option.dest,tmpf), result: path.join(option.dest,tmpr)})
                    }
                });
            }
            else{
                // FIXME: Other platform
                cb(1,`Currently not support graphviz function on ${os.type()}!`)
                // console.error(`Currently not support graphviz function on ${os.type()}!`)
            }
            
        }
    })
}

gviz.drawFile = function(file,option,cb){
    let tmp = 'drawFile-'+rs.generate(12).toString()
    option =  
        { 
            type : option.type || 'png',
            dest : option.dest || os.tmpdir(),
            output: option.output || tmp
        };
    let tmpr = option.output + '.' + option.type
    // detect os 
    if(os.type() == "Windows_NT"){
        // cb(1,`Currently not support graphviz function on ${os.type()}!`)
        // Generate the result
        p = exec(`dot -T${option.type} ${file} -o ${path.join(option.dest,tmpr)}`,(err,stdout,stderr) => {
            if(err)
                cb(1,`Error: ${stderr}`)
            else{
                console.log(`Success!\nYour result has been stored in ${path.join(option.dest,tmpr)}\n`)
                cb(0,{ result: path.join(option.dest,tmpr)})
            }
        });
    }
    else if(os.type() == "Linux"){
        // Linux
        // Generate the result
        p = exec(`dot -T${option.type} ${file} -o ${path.join(option.dest,tmpr)}`,(err,stdout,stderr) => {
            if(err)
                cb(1,`Error: ${stderr}`)
            else{
                console.log(`Success!\nYour result has been stored in ${path.join(option.dest,tmpr)}\n`)
                cb(0,{ result: path.join(option.dest,tmpr)})
            }
        });
    }
    else{
        // FIXME: Other platform
        cb(1,`Currently not support graphviz function on ${os.type()}!`)
    }
}
module.exports = gviz;