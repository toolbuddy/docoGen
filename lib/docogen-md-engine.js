const rs = require('randomstring');
const md_ast_parser = require('markdown-to-ast').parse;
const mdpdf = require('mdpdf');
const fsx = require('fs-extra');
const fh = require("filehound");
const path = require('path');
const fs = require('fs');
const os = require('os');

const md_engine = {};

md_engine.trans2md = function(jsObj){
    let title = jsObj.title;
    let options = jsObj.options;
    let author = jsObj.author; // js array
    let abs = jsObj.abstract; // js obj
    let article = jsObj.article; // js array
    let ref = jsObj.reference; // js array

    // title
    let md_content = `# ${title}\n\n`;
    md_content += `--- \n\n`;
    // author
    md_content += `## Author\n\n`;
    for(var index in author){
        md_content += `* ${author[index].name}, ${author[index].email}, [website](${author[index].website})\n`;
    }
    // abstract (using array)
    md_content += `## Abstract\n\n`;
    if(abs.content.length != "" && abs.content != undefined){
        for(var index in abs.content){
            md_content += `${abs.content[index]}\n`;
        }
        md_content += `\n`; // end 
    }
    md_content += `--- \n\n`;
    // article 
    md_content += `## Article\n\n`;
    md_content += `--- \n\n`;
    if(article.length >= 1){
        for(var index in article){
            // article title
            md_content += `### ${article[index].title}\n\n`;
            // article content
            if(article[index].content.length >= 1){
                for(var c_index in article[index].content){
                    // subtitle 
                    md_content += `#### ${article[index].content[c_index].name}\n\n`;
                    // append content here 
                    if(article[index].content[c_index].type == "text" || article[index].content[c_index].type == "none"){
                        for(var t_index in article[index].content[c_index].data){
                            md_content += `${article[index].content[c_index].data[t_index].info}\n`;
                        }
                        md_content += `\n`;
                    }
                    // if figure existed , include it
                    if(article[index].content[c_index].figure != undefined ){
                        for(var f_index in article[index].content[c_index].figure){
                            if(article[index].content[c_index].figure[f_index].path != "")
                                md_content += `<img src='${article[index].content[c_index].figure[f_index].path}' align="${article[index].content[c_index].figure[f_index].align}">\n\n`;
                        }
                        md_content += `\n`;
                    }
                    // subarticle (if exist, append it)
                    if((article[index].content[c_index].subarticle != undefined)){
                        for(var s_index in article[index].content[c_index].subarticle){
                            // sub title here 
                            // md_content += `##### ${article[index].content[c_index].subarticle[s_index].title}\n\n`;
                            if((article[index].content[c_index].subarticle[s_index].content.length >= 1) && (article[index].content[c_index].subarticle[s_index].content != undefined)){
                                for(var sc_index in article[index].content[c_index].subarticle[s_index].content){
                                    md_content += `##### ${article[index].content[c_index].subarticle[s_index].content[sc_index].name}\n\n`;
                                    // append content
                                    if(article[index].content[c_index].subarticle[s_index].content[sc_index].type == "text" || article[index].content[c_index].subarticle[s_index].content[sc_index].type == "none"){
                                        // md_content += `* ${article[index].content[c_index].subarticle[s_index].content[sc_index].text}\n\n`;
                                        for(var t_index in article[index].content[c_index].subarticle[s_index].content[sc_index].data){
                                            md_content += `${article[index].content[c_index].subarticle[s_index].content[sc_index].data[t_index].info}\n`;
                                        }
                                        md_content += `\n`;
                                    }
                                    // if figure existed , include it
                                    if(article[index].content[c_index].subarticle[s_index].content[sc_index].figure != undefined){
                                        for(var f_index in article[index].content[c_index].subarticle[s_index].content[sc_index].figure){
                                            if(article[index].content[c_index].subarticle[s_index].content[sc_index].figure[f_index].path != "")
                                                md_content += `![](${article[index].content[c_index].subarticle[s_index].content[sc_index].figure[f_index].path})\n`;
                                        }
                                        md_content += `\n`;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // reference
    md_content += `## Reference\n\n`;
    md_content += `---\n\n`;
    for(var index in ref){
        md_content += `* [${index}] ${ref[index].name}, ${ref[index].content}\n\n`;
    }
    return md_content;
}

md_engine.md2docogen = function(src_file){
    var jsonobj = md_ast_parser(fs.readFileSync(src_file,'utf-8'));
    console.log("=================== Original Markdown Ast Convert to docoGen: ===================");
    // console.dir(jsonobj); -> using online markdown-to-ast to debug
    var docogen = {};
    // Parsing title
    for(var index in jsonobj.children){
        if(jsonobj.children[index].type == 'Header' && jsonobj.children[index].depth == 1){
            // here comes the header!
            // console.log(jsonobj.children[index].children[0].value)
            // And then get the next jsonobj child as data inside
            index++;
            if(jsonobj.children[index].type == "List"){
                // start parsing the each block (biggest one)
                for(var c_index in jsonobj.children[index].children){
                    // ListItem format
                    if(jsonobj.children[index].children[c_index].type == "ListItem"){
                        // start parsing information of list item
                        for(var cc_index=0; cc_index < jsonobj.children[index].children[c_index].children.length; cc_index++){
                            // switch case
                            switch(jsonobj.children[(index-1)].children[0].value){
                                case "title":
                                    // get title 
                                    // console.log("Header: "+jsonobj.children[(index-1)].children[0].value);
                                    // Paragraph => set as header
                                    if(jsonobj.children[index].children[c_index].children[cc_index].type == "Paragraph"){
                                        //console.log("fieldname: " + jsonobj.children[index].children[c_index].children[cc_index].children[0].value);
                                    }
                                    // List => set as value
                                    if(jsonobj.children[index].children[c_index].children[++cc_index].type == "List"){
                                        // console.log(jsonobj.children[index].children[c_index].children[cc_index].children[0].type);
                                        for(var l_index in jsonobj.children[index].children[c_index].children[cc_index].children[0].children){
                                            if(jsonobj.children[index].children[c_index].children[cc_index].children[0].children[l_index].type == "Paragraph"){
                                                //console.log("value:" + jsonobj.children[index].children[c_index].children[cc_index].children[0].children[l_index].children[0].value);
                                                // assign
                                                docogen[jsonobj.children[(index-1)].children[0].value] = jsonobj.children[index].children[c_index].children[cc_index].children[0].children[l_index].children[0].value;
                                            }
                                        }
                                    }
                                break;
                                case "options":
                                    // get title 
                                    // console.log("Header: "+jsonobj.children[(index-1)].children[0].value);
                                    // initial
                                    docogen[jsonobj.children[(index-1)].children[0].value] = (docogen[jsonobj.children[(index-1)].children[0].value] == undefined)? {} : docogen[jsonobj.children[(index-1)].children[0].value];
                                    let tmpfield;
                                    // Paragraph => set as header
                                    if(jsonobj.children[index].children[c_index].children[cc_index].type == "Paragraph"){
                                        // console.log("fieldname: " + jsonobj.children[index].children[c_index].children[cc_index].children[0].value);
                                        // assign 
                                        tmpfield = jsonobj.children[index].children[c_index].children[cc_index].children[0].value;
                                    }
                                    // List => set as value
                                    if(jsonobj.children[index].children[c_index].children[++cc_index].type == "List"){
                                        // console.log(jsonobj.children[index].children[c_index].children[cc_index].children[0].type);
                                        for(var l_index in jsonobj.children[index].children[c_index].children[cc_index].children[0].children){
                                            if(jsonobj.children[index].children[c_index].children[cc_index].children[0].children[l_index].type == "Paragraph"){
                                                // console.log("value:" + jsonobj.children[index].children[c_index].children[cc_index].children[0].children[l_index].children[0].value);
                                                // assign real value
                                                let obj = docogen[jsonobj.children[(index-1)].children[0].value];
                                                obj[tmpfield] = jsonobj.children[index].children[c_index].children[cc_index].children[0].children[l_index].children[0].value;
                                                docogen[jsonobj.children[(index-1)].children[0].value] = obj;
                                            }
                                        }
                                    }
                                break;
                                case "author":
                                    // get title 
                                    // console.log("Header: "+jsonobj.children[(index-1)].children[0].value);
                                    // initial 
                                    docogen[jsonobj.children[(index-1)].children[0].value] = (docogen[jsonobj.children[(index-1)].children[0].value] == undefined) ? [] : docogen[jsonobj.children[(index-1)].children[0].value];
                                    // let tmpfield;
                                    // Paragraph => set as header
                                    if(jsonobj.children[index].children[c_index].children[cc_index].type == "Paragraph"){
                                        // console.log("fieldname: " + jsonobj.children[index].children[c_index].children[cc_index].children[0].value);
                                        // tmpfield = jsonobj.children[index].children[c_index].children[cc_index].children[0].value
                                    }
                                    // List => set as value
                                    if(jsonobj.children[index].children[c_index].children[++cc_index].type == "List"){
                                        // array 
                                        let tmpobj = {};
                                        for(var ccc_index in jsonobj.children[index].children[c_index].children[cc_index].children){
                                            for(var l_index in jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children){
                                                if(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].type == "Paragraph"){
                                                    if(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children.length <= 1){
                                                        // console.log("value:" + jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[0].value);
                                                        tmpobj[jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[0].value.split(':')[0]] = jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[0].value.split(':')[1];
                                                    }
                                                    else{
                                                        // just using raw
                                                        // console.log("raw: " + jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].raw);
                                                        let raw = jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].raw.replace(/ /g,''),obj;
                                                        tmpobj[raw.substring(0,raw.indexOf(':'))] = raw.substring(raw.indexOf(':')+1);
                                                        /*
                                                        // [FIXME] Different case (special font style/link)
                                                        for(var ll_index in jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children){
                                                            switch(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[ll_index].type){
                                                                case "Str":
                                                                    console.log("Str value: " + jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[ll_index].value);
                                                                break;
                                                                case "Link":
                                                                    // website
                                                                    console.log("Link value: " + jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[ll_index].url);
                                                                break;
                                                            }
                                                        }*/
                                                    }
                                                }
                                            }
                                        }
                                        // Push into docoGen
                                        docogen[jsonobj.children[(index-1)].children[0].value].push(tmpobj)
                                    }
                                break;
                                case "article":
                                    // TODO
                                break;
                                case "abstract":
                                    // get title 
                                    // console.log("Header: "+jsonobj.children[(index-1)].children[0].value);
                                    // initial 
                                    docogen[jsonobj.children[(index-1)].children[0].value] = (docogen[jsonobj.children[(index-1)].children[0].value] == undefined) ? [] : docogen[jsonobj.children[(index-1)].children[0].value];
                                    // let tmpfield;
                                    // Paragraph => set as header
                                    if(jsonobj.children[index].children[c_index].children[cc_index].type == "Paragraph"){
                                        // console.log("fieldname: " + jsonobj.children[index].children[c_index].children[cc_index].children[0].value);
                                        // tmpfield = jsonobj.children[index].children[c_index].children[cc_index].children[0].value
                                    }
                                    // List => set as value
                                    if(jsonobj.children[index].children[c_index].children[++cc_index].type == "List"){
                                        for(var ccc_index in jsonobj.children[index].children[c_index].children[cc_index].children){
                                            for(var l_index in jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children){
                                                if(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].type == "Paragraph"){
                                                    if(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children.length <= 1){
                                                        // console.log("value:" + jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[0].value);
                                                        docogen[jsonobj.children[(index-1)].children[0].value].push(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[0].value);
                                                    }
                                                    else{
                                                        // just using raw
                                                        // console.log("raw: " + jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].raw);
                                                        let raw = jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].raw.replace(/ /g,'');
                                                        docogen[jsonobj.children[(index-1)].children[0].value].push(raw);
                                                        /*
                                                        // [FIXME] Different case (special font style/link)
                                                        for(var ll_index in jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children){
                                                            switch(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[ll_index].type){
                                                                case "Str":
                                                                    console.log("Str value: " + jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[ll_index].value);
                                                                break;
                                                                case "Link":
                                                                    // website
                                                                    console.log("Link value: " + jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[ll_index].url);
                                                                break;
                                                            }
                                                        }*/
                                                    }
                                                }
                                            }
                                        }
                                    }
                                break;
                                case "reference":
                                    // get title 
                                    // console.log("Header: "+jsonobj.children[(index-1)].children[0].value);
                                    // initial 
                                    docogen[jsonobj.children[(index-1)].children[0].value] = (docogen[jsonobj.children[(index-1)].children[0].value] == undefined) ? [] : docogen[jsonobj.children[(index-1)].children[0].value];
                                    // let tmpfield;
                                    // Paragraph => set as header
                                    if(jsonobj.children[index].children[c_index].children[cc_index].type == "Paragraph"){
                                        // console.log("fieldname: " + jsonobj.children[index].children[c_index].children[cc_index].children[0].value);
                                        // tmpfield = jsonobj.children[index].children[c_index].children[cc_index].children[0].value
                                    }
                                    // List => set as value
                                    if(jsonobj.children[index].children[c_index].children[++cc_index].type == "List"){
                                        // array 
                                        let tmpobj = {};
                                        for(var ccc_index in jsonobj.children[index].children[c_index].children[cc_index].children){
                                            for(var l_index in jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children){
                                                if(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].type == "Paragraph"){
                                                    if(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children.length <= 1){
                                                        // console.log("value:" + jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[0].value);
                                                        tmpobj[jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[0].value.split(':')[0]] = jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[0].value.split(':')[1];
                                                    }
                                                    else{
                                                        // just using raw (mostly link)
                                                        // console.log("raw: " + jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].raw);
                                                        let raw = jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].raw.replace(/ /g,''),obj;
                                                        tmpobj[raw.substring(0,raw.indexOf(':'))] = raw.substring(raw.indexOf(':')+1);
                                                        /*
                                                        // [FIXME] Different case (special font style/link)
                                                        for(var ll_index in jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children){
                                                            switch(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[ll_index].type){
                                                                case "Str":
                                                                    console.log("Str value: " + jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[ll_index].value);
                                                                break;
                                                                case "Link":
                                                                    // website
                                                                    console.log("Link value: " + jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[ll_index].url);
                                                                break;
                                                            }
                                                        }*/
                                                    }
                                                }
                                            }
                                        }
                                        // Push into docoGen
                                        docogen[jsonobj.children[(index-1)].children[0].value].push(tmpobj)
                                    }
                                break;
                                default:
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    return docogen;
}

module.exports = md_engine;