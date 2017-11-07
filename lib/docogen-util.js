// util of docoGen
const path = require('path'),
    fsx = require('fs-extra');

const utils = {}

utils.resolve_figure = function(jsObj,dirname){
    if(jsObj.length == 0){
        return jsObj;
    }
    for(var index in jsObj){
        // inside figure
        if(jsObj[index].content != undefined){
            for(var c_index in jsObj[index].content){
                // outside figure 
                if(jsObj[index].content[c_index].figure != undefined && jsObj[index].content[c_index].figure.length > 0){
                    for(var f_index in jsObj[index].content[c_index].figure){
                        // only relative need to be done, default value is rel
                        jsObj[index].content[c_index].figure[f_index].flag = (jsObj[index].content[c_index].figure[f_index].flag == undefined) ? "rel" : jsObj[index].content[c_index].figure[f_index].flag; 
                        if(jsObj[index].content[c_index].figure[f_index].path != "" && jsObj[index].content[c_index].figure[f_index].flag == "rel"){
                            // resolve the path 
                            console.log(`Outside Before: ${jsObj[index].content[c_index].figure[f_index].path}`)
                            jsObj[index].content[c_index].figure[f_index].path = path.resolve(dirname,jsObj[index].content[c_index].figure[f_index].path)
                            console.log(`Outside After: ${jsObj[index].content[c_index].figure[f_index].path}`)
                        }
                    }
                }
                if(jsObj[index].content[c_index].type == "figure"){
                    for(var d_index in jsObj[index].content[c_index].data){
                        // only relative need to be done, default value is rel
                        jsObj[index].content[c_index].data[d_index].flag == (jsObj[index].content[c_index].data[d_index].flag == undefined) ? "rel" : jsObj[index].content[c_index].data[d_index].flag;
                        if(jsObj[index].content[c_index].data[d_index].path && jsObj[index].content[c_index].data[d_index].flag == "rel"){
                            // resolve the path     
                            console.log(`Before: ${jsObj[index].content[c_index].data[d_index].path}`)
                            jsObj[index].content[c_index].data[d_index].path = path.resolve(dirname,jsObj[index].content[c_index].data[d_index].path)
                            console.log(`After: ${jsObj[index].content[c_index].data[d_index].path}`)
                        }
                    }
                }
                // subarticle (nested)
                if(jsObj[index].content[c_index].subarticle != undefined && jsObj[index].content[c_index].subarticle.length > 0){
                    jsObj[index].content[c_index].subarticle = this.resolve_figure(jsObj[index].content[c_index].subarticle,dirname);
                }
            }
        }
    }

    return jsObj;
}

module.exports = utils;