// util of docoGen
const path = require('path'),
    os = require('os'),
    fsx = require('fs-extra');

const utils = {}

// Resolve the relative path 
utils.resolve = function(jsObj,dirname){
    console.log("Resolving Root: " + dirname)
    if(jsObj.length == 0){
        return jsObj;
    }
    for(var index in jsObj){
        // inside figure
        if(jsObj[index].content != undefined){
            for(var c_index in jsObj[index].content){
                // "figure" section
                if(jsObj[index].content[c_index].figure != undefined && jsObj[index].content[c_index].figure.length > 0){
                    for(var f_index in jsObj[index].content[c_index].figure){
                        // only relative need to be done, default value is rel
                        jsObj[index].content[c_index].figure[f_index].flag = (jsObj[index].content[c_index].figure[f_index].flag == undefined) ? "rel" : jsObj[index].content[c_index].figure[f_index].flag; 
                        if(jsObj[index].content[c_index].figure[f_index].path != "" && jsObj[index].content[c_index].figure[f_index].flag == "rel"){
                            // resolve the path 
                            console.log(`Outside Before: ${jsObj[index].content[c_index].figure[f_index].path}`)
                            jsObj[index].content[c_index].figure[f_index].path = path.resolve(dirname,jsObj[index].content[c_index].figure[f_index].path)
                            // If os version is Windows, need to replace again!
                            if(os.type() == "Windows_NT"){
                                jsObj[index].content[c_index].figure[f_index].path = jsObj[index].content[c_index].figure[f_index].path.replace(/\\/g,'/');           
                            }
                            console.log(`Outside After: ${jsObj[index].content[c_index].figure[f_index].path}`)
                        }
                    }
                }
                // "figure" in data section
                if(jsObj[index].content[c_index].type == "figure"){
                    for(var d_index in jsObj[index].content[c_index].data){
                        // only relative need to be done, default value is rel
                        jsObj[index].content[c_index].data[d_index].flag == (jsObj[index].content[c_index].data[d_index].flag == undefined) ? "rel" : jsObj[index].content[c_index].data[d_index].flag;
                        if(jsObj[index].content[c_index].data[d_index].path && jsObj[index].content[c_index].data[d_index].flag == "rel"){
                            // resolve the path     
                            console.log(`Inside Before: ${jsObj[index].content[c_index].data[d_index].path}`)
                            jsObj[index].content[c_index].data[d_index].path = path.resolve(dirname,jsObj[index].content[c_index].data[d_index].path)
                            // If os version is Windows, need to replace again!
                            if(os.type() == "Windows_NT"){
                                jsObj[index].content[c_index].data[d_index].path = jsObj[index].content[c_index].data[d_index].path.replace(/\\/g,'/');           
                            }
                            console.log(`Inside After: ${jsObj[index].content[c_index].data[d_index].path}`)
                        }
                    }
                }
                // "Code" in data section
                if(jsObj[index].content[c_index].type == "code"){
                    for(var d_index in jsObj[index].content[c_index].data){
                        // only relative need to be done, default value is rel
                        jsObj[index].content[c_index].data[d_index].flag == (jsObj[index].content[c_index].data[d_index].flag == undefined) ? "rel" : jsObj[index].content[c_index].data[d_index].flag;
                        // only need to deal with relative path
                        if(jsObj[index].content[c_index].data[d_index].flag == "rel")
                            if(jsObj[index].content[c_index].data[d_index].src != undefined || jsObj[index].content[c_index].data[d_index].src != ""){
                                // resolve the path     
                                console.log(`Inside Before: ${jsObj[index].content[c_index].data[d_index].src}`)
                                jsObj[index].content[c_index].data[d_index].src = path.resolve(dirname,jsObj[index].content[c_index].data[d_index].src)
                                // If os version is Windows, need to replace again!
                                if(os.type() == "Windows_NT"){
                                    jsObj[index].content[c_index].data[d_index].src = jsObj[index].content[c_index].data[d_index].src.replace(/\\/g,'/');           
                                }
                                console.log(`Inside After: ${jsObj[index].content[c_index].data[d_index].src}`)
                            }
                    }
                }
                // "Graphviz" in data section
                if(jsObj[index].content[c_index].type == "graphviz"){
                    for(var d_index in jsObj[index].content[c_index].data){
                        // only relative need to be done, default value is rel
                        jsObj[index].content[c_index].data[d_index].flag == (jsObj[index].content[c_index].data[d_index].flag == undefined) ? "rel" : jsObj[index].content[c_index].data[d_index].flag;
                        // only need to deal with relative path
                        if(jsObj[index].content[c_index].data[d_index].flag == "rel")
                            if(jsObj[index].content[c_index].data[d_index].src != undefined || jsObj[index].content[c_index].data[d_index].src != ""){
                                // resolve the path     
                                console.log(`Inside Before: ${jsObj[index].content[c_index].data[d_index].src}`)
                                jsObj[index].content[c_index].data[d_index].src = path.resolve(dirname,jsObj[index].content[c_index].data[d_index].src)
                                // If os version is Windows, need to replace again!
                                if(os.type() == "Windows_NT"){
                                    jsObj[index].content[c_index].data[d_index].src = jsObj[index].content[c_index].data[d_index].src.replace(/\\/g,'/');           
                                }
                                console.log(`Inside After: ${jsObj[index].content[c_index].data[d_index].src}`)
                            }
                    }
                }
                // subarticle (nested)
                if(jsObj[index].content[c_index].subarticle != undefined && jsObj[index].content[c_index].subarticle.length > 0){
                    jsObj[index].content[c_index].subarticle = this.resolve(jsObj[index].content[c_index].subarticle,dirname);
                }
            }
        }
    }

    return jsObj;
}

// Stripping for and other usage
utils.strip_latex_format = function(src_str,delimit_start,delimit_end){
    console.log("Before Strip: " + src_str);
    // strip
    src_str = src_str.substring(src_str.indexOf(delimit_start)+delimit_start.length,src_str.lastIndexOf(delimit_end));
    console.log("After Strip: " + src_str);
    return src_str;
}

module.exports = utils;