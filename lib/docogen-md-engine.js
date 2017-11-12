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
                                    // initial
                                    docogen[jsonobj.children[(index-1)].children[0].value] = (docogen[jsonobj.children[(index-1)].children[0].value] == undefined) ? [] : docogen[jsonobj.children[(index-1)].children[0].value];
                                    // Paragraph => each article
                                    // List => parse it and set as content
                                    if(jsonobj.children[index].children[c_index].children[++cc_index].type == "List"){
                                        let article = { content: []};
                                        for(var ccc_index in jsonobj.children[index].children[c_index].children[cc_index].children){
                                            for(var l_index in jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children){
                                                if(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].type == "Paragraph"){
                                                    if(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children.length <= 1){
                                                        console.log("value:" + jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[0].value);
                                                        if(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[0].value == "content"){
                                                            // push content into content body
                                                            article.content.push(parse_content(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index]));
                                                        }
                                                        else if(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[0].value == "subarticle"){
                                                            // TODO: subarticle append
                                                            // curr_obj has 2 element, [0] is figure, [1] is leftover part => notice: need to send "children" array into parse_by_block
                                                            let curr_obj = jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children; 
                                                            // parsing the leftover part, returning an array
                                                            article["subarticle"] = create_subarticle(curr_obj);
                                                        }
                                                        else if(jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[0].value == "figure"){
                                                            // TODO: figure(outside) append
                                                            // curr_obj has 2 element, [0] is figure, [1] is leftover part => notice: need to send "children" array into parse_by_block
                                                            let curr_obj = jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children; 
                                                            // parsing the leftover part, returning an array
                                                            article["figure"] = parse_by_block(curr_obj);
                                                        }
                                                        else{
                                                            // Assign 
                                                            let field = jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[0].value.split(':')[0],
                                                                value = jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].children[0].value.split(':')[1]
                                                            if(field == "priority"){
                                                                article[field] = parseInt(value)
                                                            }
                                                            else
                                                                article[field] = value;
                                                        }
                                                    }
                                                    else{
                                                        // just using raw
                                                        console.log("raw: " + jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].raw);
                                                        // let raw = jsonobj.children[index].children[c_index].children[cc_index].children[ccc_index].children[l_index].raw.replace(/ /g,'');
                                                        // docogen[jsonobj.children[(index-1)].children[0].value].push(raw);
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
                                        docogen[jsonobj.children[(index-1)].children[0].value].push(article)
                                    }
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

function create_subarticle(parent){
    // Need to return all subarticles as array
    let arr = [];
    // parse parent[1] as elements array
    for(var index=0; index < parent[1].children.length;index++){
        let article = {content:[]}
        // parent[1].children[index].children[0] => article itself!
        // console.dir(parent[1].children[index].children[1].children)
        for(var a_index=0; a_index < parent[1].children[index].children[1].children.length; a_index++){
            console.log(parent[1].children[index].children[1].children[a_index].children[0].raw)
            switch(parent[1].children[index].children[1].children[a_index].children[0].raw.replace(/ /g,'')){
                case "content":
                    article.content.push(parse_content(parent[1].children[index].children[1].children[a_index]));
                break;
                case "figure":
                    article["figure"] = parse_by_block(parent[1].children[index].children[1].children[a_index].children);
                break;
                case "subarticle":
                    article["subarticle"] = create_subarticle(parent[1].children[index].children[1].children[a_index].children);
                break;
                default:
                    // title 
                    article[parent[1].children[index].children[1].children[a_index].children[0].raw.split(':')[0].replace(/ /g,'')] = parent[1].children[index].children[1].children[a_index].children[0].raw.split(':')[1];
                break;
            }
        }
        arr.push(article)
    }
    return arr;
}

function parse_by_block(parent){
    let arr = [];
    // parse parent[1] as elements array
    for(var index=0; index < parent[1].children.length;index++){
        let block = {}
        // layer "block", children of it has 2 elements, too.
        // "Notice": You can specify the field here by element[0]'s value
        // using element[1] 
        for(var b_index in parent[1].children[index].children[1].children){
            // And "raw" of the first element of children, contains all the un-parsing value
            let raw = parent[1].children[index].children[1].children[b_index].children[0].raw;
            block[raw.split(':')[0]] = raw.split(':')[1]
            // console.log(parent[1].children[index].children[1].children[b_index].children[0].raw)
        }
        // console.log(parent[1].children[index].raw);
        arr.push(block)
    }

    return arr;
}

function parse_content(ast_obj_array){
    // ast_obj_array[0] => "content" 
    // specify the List Object => ast_obj_array.children[1] => information of content
    // Here comes ListItem
    var type = "",content_element = { data: [] };
    // console.dir((ast_obj_array.children[1]));
    for(var index=0;index < ast_obj_array.children[1].children.length ;index++){
        if(ast_obj_array.children[1].children[index].children[0].raw == "data"){
            // push data element into data body
            content_element.data = content_element.data.concat(parse_data(type,ast_obj_array.children[1].children[index]));
        }
        else{
            console.log("Content Nested: "+ast_obj_array.children[1].children[index].children[0].raw);
            let field = ast_obj_array.children[1].children[index].children[0].raw.split(':')[0],
                value = ast_obj_array.children[1].children[index].children[0].raw.split(':')[1];
            if(field == "type"){
                type = value.replace(/ /g,'')
            }
            content_element[field] = value;
        }
    }
    return content_element
}

function parse_data(type,ast_obj_array){
    // initial data element
    let data_arr = [];
    console.log(`============ Parsing: ${type} ============`);
    for(var index=0;index < ast_obj_array.children[1].children.length ;index++){
        let data_element = {}
        switch(type){
            case "none":
                // Just append in array, without nested 
                console.log("None-Text: "+ast_obj_array.children[1].children[index].children[0].raw);
                data_element["info"] = ast_obj_array.children[1].children[index].children[0].raw
            break;
            case "text":
                // Just append in array, without nested 
                console.log("Text: "+ast_obj_array.children[1].children[index].children[0].raw);
                data_element["info"] = ast_obj_array.children[1].children[index].children[0].raw
            break;
            case "list":
                console.log("List: "+ast_obj_array.children[1].children[index].children[0].raw);
                data_element["name"] = ast_obj_array.children[1].children[index].children[0].raw
                //console.log(JSON.stringify(ast_obj_array.children[1].children[index].children))
                if(ast_obj_array.children[1].children[index].children != undefined && ast_obj_array.children[1].children[index].children.length > 1){
                    // This list has subitems!
                    data_element["subitems"] = nested_rec(ast_obj_array.children[1].children[index].children,{field: "name",nested:"subitems"})
                }
            break;
            case "table":
                console.log("Column: "+ast_obj_array.children[1].children[index].children[0].raw);
                data_element["title"] = ast_obj_array.children[1].children[index].children[0].raw
                if(ast_obj_array.children[1].children[index].children != undefined && ast_obj_array.children[1].children[index].children.length > 1){
                    // Parse the elements in table
                    data_element["value"] = nested(ast_obj_array.children[1].children[index].children)
                }
            break;
            case "formula":
                // parsing 
                let raw = ast_obj_array.children[1].children[index].children[0].raw;
                // pack element
                if(ast_obj_array.children[1].children[index].children != undefined && ast_obj_array.children[1].children[index].children.length > 1){
                    // Parse the elements
                    data_element = nested_ex(ast_obj_array.children[1].children[index].children)
                }
            break;
            case "code":
                // use
                console.log("Raw Code Info: " + ast_obj_array.children[1].children[index].children[0].raw)
                if(ast_obj_array.children[1].children[index].children != undefined && ast_obj_array.children[1].children[index].children.length > 1){
                    // Parse the elements
                    data_element = nested_ex(ast_obj_array.children[1].children[index].children)
                }
            break;
            case "figure":
                // use
                console.log("Raw Figure Info: " + ast_obj_array.children[1].children[index].children[0].raw)
                if(ast_obj_array.children[1].children[index].children != undefined && ast_obj_array.children[1].children[index].children.length > 1){
                    // Parse the elements
                    data_element = nested_ex(ast_obj_array.children[1].children[index].children)
                }
            break;
            case "web-restful-api":
                if(ast_obj_array.children[1].children[index].children != undefined && ast_obj_array.children[1].children[index].children.length > 1){
                    // Parse the elements
                    data_element = nested_ex(ast_obj_array.children[1].children[index].children)
                }
                
            break;
        }
        data_arr.push(data_element);
    }
    return data_arr
}

function nested_rec(obj_arr,options){
    // initial array 
    let arr = []
    // console.log("Nested list: " + JSON.stringify(obj_arr))
    options = (options == undefined) ? {} : options;
    for(var index=0;index<obj_arr[1].children.length;index++){
        let element ={};
        if(obj_arr[1].children[index].children[0].raw != options.filter){
            console.log("Rec Nested Item: " + obj_arr[1].children[index].children[0].raw)
            element[options.field] = obj_arr[1].children[index].children[0].raw
        }
        if(obj_arr[1].children[index].children != undefined && obj_arr[1].children[index].children.length > 1){
            // Nested!
            element[options.nested] = nested_rec(obj_arr[1].children[index].children)
        }
        arr.push(element);
    }
    return arr
}

function nested_rec_ex(obj_arr){
    // initial array 
    let arr = []
    // console.log("Nested list: " + JSON.stringify(obj_arr))
    for(var index=0;index<obj_arr[1].children.length;index++){
        let element ={};
        if(obj_arr[1].children[index].children != undefined && obj_arr[1].children[index].children.length > 1){
            // Nested!
            element = nested_ex(obj_arr[1].children[index].children,{strip: true    })
        }
        arr.push(element);
    }
    return arr
}

function nested(obj_arr){
    // without recursive, just one time
    let arr = [];
    for(var index=0;index<obj_arr[1].children.length;index++){
        console.log("Non-Rec nested Item: " + obj_arr[1].children[index].children[0].raw)
        arr.push(obj_arr[1].children[index].children[0].raw);
    }

    return arr
}

function nested_ex(obj_arr,options){
    let element = {};
    options = (options == undefined) ? {} : options;
    for(var index=0;index<obj_arr[1].children.length;index++){
        console.log("Non-Rec nested Item ex: " + obj_arr[1].children[index].children[0].raw)
        // arr.push(obj_arr[1].children[index].children[0].raw);
        if(options.strip == undefined)
            element[obj_arr[1].children[index].children[0].raw.split(':')[0]] = obj_arr[1].children[index].children[0].raw.split(':')[1]
        else
            element[obj_arr[1].children[index].children[0].raw.split(':')[0]] = obj_arr[1].children[index].children[0].raw.split(':')[1].replace(/ /g,'')
        // strip space (for switch case)
        obj_arr[1].children[index].children[0].raw = (obj_arr[1].children[index].children[0].raw.split(':')[1] != undefined) ? obj_arr[1].children[index].children[0].raw : obj_arr[1].children[index].children[0].raw.replace(/ /g,''); 
        
        // for special cast 
        switch(obj_arr[1].children[index].children[0].raw){
            case "field": 
                element["field"] = nested_rec_ex(obj_arr[1].children[index].children)
            break;
            case "error":
                element["error"] = nested(obj_arr[1].children[index].children)
            break;
            case "success":
                element["success"] = nested(obj_arr[1].children[index].children)
            break;
        }
    }
    return element;
}

module.exports = md_engine;