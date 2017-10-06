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
    let latex_content = `\\documentclass{${options.type}}\n\\usepackage{graphicx}\n\\graphicspath{{}}\n\n\\begin{document}\n\n`;
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
    for(var index in article){
        latex_content += `\\section{${article[index].title}}\n\n`;
        for(var c_index in article[index].content){
            // none type 
            if(article[index].content[c_index].type == "none"){
                latex_content += `{\\large ${article[index].content[c_index].name}}\\\\\n\n`;
                for(var t_index in article[index].content[c_index].data){
                    latex_content += `${article[index].content[c_index].data[t_index].info}\\\\\n`
                }
                latex_content += `\n`;
            }
            // type detect - text
            if(article[index].content[c_index].type == "text"){
                // append title
                latex_content += `\\subsection{${article[index].content[c_index].name}}\n\n`;
                for(var t_index in article[index].content[c_index].data){
                    latex_content += `${article[index].content[c_index].data[t_index].info}\\\\\n`
                }
                latex_content += `\n`;
            }
            // type detect - list
            if(article[index].content[c_index].type == "list"){
                // append title
                latex_content += `\\subsection{${article[index].content[c_index].name}}\n\n`;
                let concater = "";
                // append function 
                let nested = append_nested(concater,article[index].content[c_index].data);
                latex_content += nested;
                latex_content += `\n\n`;
            }
            // figure 
            if(article[index].content[c_index].figure != undefined){
                // latex_content += `\\includegraphics[width=\\textwidth]{${article[index].content[c_index].figure}}\n\n`;
                for(var f_index in article[index].content[c_index].figure){
                    if(article[index].content[c_index].figure[f_index].path != ""){
                        // legal path
                        latex_content += `\\begin{figure}[tbp]\n\\begin{${article[index].content[c_index].figure[f_index].align}}\n`;
                        latex_content += `\\includegraphics[width=\\textwidth]{${article[index].content[c_index].figure[f_index].path}}\n`;
                        latex_content += `\\end{${article[index].content[c_index].figure[f_index].align}}\n\\end{figure}\n\n`;
                    }
                }
            }
            // subarticle
            for(var s_index in article[index].content[c_index].subarticle){
                for(var sc_index in article[index].content[c_index].subarticle[s_index].content){
                    // none type 
                    if(article[index].content[c_index].subarticle[s_index].content[sc_index].type == "none"){
                        latex_content += `{\\large ${article[index].content[c_index].subarticle[s_index].content[sc_index].name}}\\\\\n\n`;
                        for(var t_index in article[index].content[c_index].subarticle[s_index].content[sc_index].data){
                            latex_content += `${article[index].content[c_index].subarticle[s_index].content[sc_index].data[t_index].info}\\\\\n`
                        }
                        latex_content += `\n`;
                    }
                    if(article[index].content[c_index].subarticle[s_index].content[sc_index].type == "text"){
                        latex_content += `\\subsubsection{${article[index].content[c_index].subarticle[s_index].content[sc_index].name}}\n\n`;
                        // latex_content += `${article[index].content[c_index].subarticle[s_index].content[sc_index].text}\n\n`;
                        for(var t_index in article[index].content[c_index].subarticle[s_index].content[sc_index].data){
                            latex_content += `${article[index].content[c_index].subarticle[s_index].content[sc_index].data[t_index].info}\\\\\n`
                        }
                        latex_content += `\n`;
                    }
                    // type detect - list
                    if(article[index].content[c_index].subarticle[s_index].content[sc_index].type == "list"){
                        latex_content += `\\subsubsection{${article[index].content[c_index].subarticle[s_index].content[sc_index].name}}\n\n`;
                        latex_content += `\\begin{enumerate}\n`;
                        let concater = "";
                        for(var t_index in article[index].content[c_index].subarticle[s_index].content[sc_index].data){
                            // append function 
                            let nested = append_nested(concater,article[index].content[c_index].subarticle[s_index].content[sc_index].data[t_index]);
                            latex_content += nested;
                        }
                        latex_content += `\\end{enumerate}\n`;
                    }
                }
                // sub section figure
                if(article[index].content[c_index].subarticle[s_index].content[sc_index].figure != undefined){
                    // latex_content += `\\includegraphics[width=\\textwidth]{${article[index].content[c_index].figure}}\n\n`;
                    for(var f_index in article[index].content[c_index].subarticle[s_index].content[sc_index].figure){
                        if(article[index].content[c_index].subarticle[s_index].content[sc_index].figure[f_index].path != ""){
                            // legal path
                            latex_content += `\\begin{figure}[tbp]\n\\begin{${article[index].content[c_index].subarticle[s_index].content[sc_index].figure[f_index].align}}\n`;
                            latex_content += `\\includegraphics[width=\\textwidth]{${article[index].content[c_index].subarticle[s_index].content[sc_index].figure[f_index].path}}\n`;
                            latex_content += `\\end{${article[index].content[c_index].subarticle[s_index].content[sc_index].figure[f_index].align}}\n\\end{figure}\n\n`;
                        }
                    }
                }
            }
        }
    }

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