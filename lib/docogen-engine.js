const rs = require('randomstring');
const mdpdf = require('mdpdf');
const fsx = require('fs-extra');
const fh = require("filehound");
const path = require('path');
const fs = require('fs');
const os = require('os');

const engine = {};

engine.trans2latex = function(jsObj){
    let title = jsObj.title;
    let options = jsObj.options;
    let author = jsObj.author; // js array
    let abs = jsObj.abstract; // js obj
    let article = jsObj.article; // js array
    let ref = jsObj.reference; // js array
    // init
    let latex_content = `\\documentclass{${options.type}}\n\\usepackage{graphicx}\n\\usepackage{CJKutf8}\n\\graphicspath{{}}\n\n\\begin{document}\n\n`;
    // concat title 
    latex_content += `\\title{${title}}\n\n`;
    // concat author
    for(var index in author){
        latex_content += `\\author{${author[index].name}}\n`;
    }
    // make title
    latex_content += "\n\\maketitle\n\n";
    // get abstract
    latex_content += "\n\\begin{abstract}\n";
    for(var index in abs.content){
        latex_content += abs.content[index] + '\n';
    }
    latex_content += "\n\\end{abstract}\n";
    // append article
    latex_content = append_article(latex_content,article,0);

    // reference
    latex_content += `\\begin{thebibliography}{99}\n\n`;
    for(var index in ref){
        latex_content += `\\bibitem{${ref[index].name}}\n${ref[index].name}, ${ref[index].content}\n\n`;
    }
    latex_content += `\\end{thebibliography}\n\n`;

    // end 
    latex_content += `\\end{document}\n`;

    return latex_content;
}

engine.trans2md = function(jsObj){
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

// article structure 
function append_article(concater,items,depth){
    // append article body
    for(var index in items){
        // append section 
        let sub = "\\";
        if(depth < 3){
            for(var i=0;i<depth;i++){
                sub += `sub`;
            }
            sub += `section{${items[index].title}}\n\n`;
        }
        else{
            // FIXME: not being tested!
            sub += `paragraph{${items[index].title}}\n\n`;
        }
        concater += sub;
        // base on type to do different thing
        for(var c_index in items[index].content){
            switch(items[index].content[c_index].type){
                case "none":
                    concater += `{\\large ${items[index].content[c_index].name}}\\\\\n\n`;
                    for(var t_index in items[index].content[c_index].data){
                        concater += `${items[index].content[c_index].data[t_index].info}\\\\\n`
                    }
                    concater += `\n`;
                break;
                case "text":
                    concater += `${items[index].content[c_index].name}\\\\\n\n`;
                    for(var t_index in items[index].content[c_index].data){
                        concater += `${items[index].content[c_index].data[t_index].info}\\\\\n`
                    }
                    concater += `\n`;
                break;
                case "list":
                    // append title
                    concater += `${items[index].content[c_index].name}\n\n`;
                    let list_concat = "";
                    // append function 
                    let nested = append_nested(list_concat,items[index].content[c_index].data);
                    concater += nested;
                    concater += `\n\n`;
                break;
            }
            // figure part
            if(items[index].content[c_index].figure != undefined){
                for(var f_index in items[index].content[c_index].figure){
                    if(items[index].content[c_index].figure[f_index].path != ""){
                        // legal path
                        concater += `\\begin{figure}[tbp]\n\\begin{${items[index].content[c_index].figure[f_index].align}}\n`;
                        concater += `\\includegraphics[width=\\textwidth]{${items[index].content[c_index].figure[f_index].path}}\n`;
                        concater += `\\end{${items[index].content[c_index].figure[f_index].align}}\n\\end{figure}\n\n`;
                    }
                }
            }
            // detect subarticle
            if(items[index].content[c_index].subarticle != undefined && items[index].content[c_index].subarticle.length >= 1){
                concater = append_article(concater,items[index].content[c_index].subarticle,depth+1);
            }
        }
    }
    return concater;
}

// list structure operation
function append_nested(concater,items){
    concater += `\\begin{enumerate}\n`;
    for(var index in items){
        concater += `\\item ${items[index].name}\n`;
        // doing append job
        if(items[index].subitems != undefined){
            concater = append_nested(concater,items[index].subitems); 
        }
    }
    concater += `\\end{enumerate}\n`;
    return concater;
}

module.exports = engine;