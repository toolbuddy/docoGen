const latex = require('node-latex-pdf');
const rs = require('randomstring');
// const mdpdf = require('markdown-pdf');
const mdpdf = require('mdpdf');
const fsx = require('fs-extra');
const fh = require("filehound");
const path = require('path');
const fs = require('fs');
const os = require('os');
// const docogen = {};

exports.generate_latexpdf = function(src,dest,options,cb){
    // find our file extension name
    const files = fh.create().paths(src).ext('docogen').find((err,files) => {
        if(err)
            cb(1,"error");
        else{
            // strip all test file in node_modules
            for(var index in files){
                if(files[index].indexOf('node_modules') != -1){
                    files.splice(index,1);
                }
            }
            // doing the work without merging
            if(files.length <= 1){
                // get file name 
                let fname = '';
                if(os.type() == "Windows_NT"){
                    fname = files[0].split('\\').splice(-1)[0].split('.')[0];
                }
                else{
                    // Linux
                    fname = files[0].split('/').splice(-1)[0].split('.')[0];
                }
                // using defined output filename or not 
                let output = `${options.output}.dgtmp` || `${rs.generate(5)}-${fname}.dgtmp`;
                fs.writeFileSync(`${os.tmpdir()}/${output}`,trans2latex(JSON.parse(fs.readFileSync(files[0],'utf-8'))));
                // convert to latex pdf 
                latex(`${os.tmpdir()}/${output}`,dest,(err,pdfPath) => {
                    if(err)
                        cb(1,"latex error");
                    else
                        cb(0,`[Docogen] Job done. ${src} successfully convert into latex pdf format in ${pdfPath}`);
                })
            }
            else{
                // multiple docogen files merging
                // using defined output filename or not 
                let output = `${options.output}.dgtmp` || `${rs.generate(5)}-merginglatex.dgtmp`;
                // merging
                fs.writeFileSync(`${os.tmpdir()}/${output}`,trans2latex(this.merge_docogen(files)));
                // convert to latex pdf 
                latex(`${os.tmpdir()}/${output}`,dest,(err,pdfPath) => {
                    if(err)
                        cb(1,"latex error");
                    else
                        cb(0,`[Docogen - Merging process] Job done. ${src} successfully convert into latex pdf format in ${pdfPath}`);
                })
            }
        }
    });
}

exports.generate_mdpdf = function(src,dest,options,cb){
    // find our file extension
    const files = fh.create().paths(src).ext('docogen').find((err,files) => {
        if(err)
            cb(1,"error");
        else{
            // strip all test file in node_modules
            for(var index in files){
                if(files[index].indexOf('node_modules') != -1){
                    files.splice(index,1);
                }
            }
            if(files.length <= 1){
                // get file name 
                let fname = '';
                if(os.type() == "Windows_NT"){
                    fname = files[0].split('\\').splice(-1)[0].split('.')[0];
                }
                else{
                    // Linux
                    fname = files[0].split('/').splice(-1)[0].split('.')[0];
                }
                // using defined output filename or not 
                let output = `${options.output}.pdf` || `${rs.generate(5)}-${fname}.pdf`;
                fs.writeFileSync(os.tmpdir()+'/'+output+'.md',trans2md(JSON.parse(fs.readFileSync(files[0],'utf-8'))));
                let opt = {
                    source: os.tmpdir()+'/'+output+'.md',
                    destination: path.join(dest,output),
                    pdf: {
                        format: 'A4',
                        header: {
                            height: 0
                        }
                    }
                };
                // converting
                mdpdf.convert(opt).then((pdfPath) => {
                    cb(0,`[Docogen] Job done. ${src} successfully convert into markdown pdf format in ${pdfPath}`);
                }).catch((err) => {
                    cb(1,`[Docogen] Job failed.`);
                });
            }
            else{
                // multiple docogen files merging
                // using defined output filename or not 
                let output = `${options.output}.pdf` || `${rs.generate(5)}-mergingmd.pdf`;
                fs.writeFileSync(os.tmpdir()+'/'+output+'.md',trans2md(this.merge_docogen(files)));
                let opt = {
                    source: os.tmpdir()+'/'+output+'.md',
                    destination: path.join(dest,output),
                    pdf: {
                        format: 'A4',
                        header: {
                            height: 0
                        }
                    }
                };
                // converting
                mdpdf.convert(opt).then((pdfPath) => {
                    cb(0,`[Docogen - Merging process] Job done. ${src} successfully convert into markdown pdf format in ${pdfPath}`);
                }).catch((err) => {
                    cb(1,`[Docogen] Job failed.`);
                });
            }
        }
    });
}

exports.merge_docogen = function(src_arr,options){
    // here comes the files list
    let jsobj = {};
    console.log("Have " + src_arr.length + " files.");
    if(options.detail == true){
        console.dir(src_arr); // print out all the files name
    }
    // Support "article","reference" part merging
    for(var index in src_arr){
        var tmp = JSON.parse(fs.readFileSync(src_arr[index],'utf-8'));
        // ============ set title (only one time) ============
        if(tmp.title != undefined && jsobj.title == undefined){
            jsobj.title = tmp.title;
        }
        // ============ set options (only one time) ============
        if(tmp.options != undefined && jsobj.options == undefined){
            jsobj.options = tmp.options;
        }
        // ============ set author (only one time) ============
        if(tmp.author != undefined && jsobj.author == undefined){
            jsobj.author = tmp.author;
        }
        // ============ set abstract (only one time) ============
        if(tmp.abstract != undefined && jsobj.abstract == undefined){
            jsobj.abstract = tmp.abstract;
        }
        // ============ merge article ============
        if(tmp.article != undefined && jsobj.article == undefined){
            // first time setting
            jsobj.article = tmp.article;
        }
        else if( tmp.article != undefined && jsobj.article.length >= 1 ){
            // concat then sort , by priority 
            jsobj.article = jsobj.article.concat(tmp.article);
            // sort by prority 
            jsobj.article.sort(function(a,b){
                return (a.priority - b.priority);
            });
        }
        // ============ merge reference ============
        if( tmp.reference != undefined ){
            if( jsobj.reference == undefined ) jsobj.reference = tmp.reference;
            else {
                // just concat 
                jsobj.reference = jsobj.reference.concat(tmp.reference);
            }
        }
    }
    // return result jsObj
    return jsobj;
}

function trans2md(jsObj){
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
            md_content += `### ${article[index].name}\n\n`;
            // article content
            if(article[index].content.length >= 1){
                for(var c_index in article[index].content){
                    // append content here 
                    if(article[index].content[c_index].type == "text"){
                        md_content += `* ${article[index].content[c_index].text}\n\n`;
                    }
                    // if figure existed , include it
                    if(article[index].content[c_index].figure != "" && article[index].content[c_index].figure != undefined ){
                        // md_content += `![image](${article[index].content[c_index].figure})\n\n`;
                        md_content += `<img src='${article[index].content[c_index].figure}' align="center">\n\n`;
                    }
                    // subarticle (if exist, append it)
                    if((article[index].content[c_index].subarticle.length >= 1) && (article[index].content[c_index].subarticle != undefined)){
                        for(var s_index in article[index].content[c_index].subarticle){
                            // sub title here 
                            md_content += `#### ${article[index].content[c_index].subarticle[s_index].name}\n\n`;
                            if((article[index].content[c_index].subarticle[s_index].content.length >= 1) && (article[index].content[c_index].subarticle[s_index].content != undefined)){
                                for(var sc_index in article[index].content[c_index].subarticle[s_index].content){
                                    // append content
                                    if(article[index].content[c_index].subarticle[s_index].content[sc_index].type == "text"){
                                        md_content += `* ${article[index].content[c_index].subarticle[s_index].content[sc_index].text}\n\n`;
                                    }
                                    // if figure existed , include it
                                    if(article[index].content[c_index].subarticle[s_index].content[sc_index].figure != "" && article[index].content[c_index].subarticle[s_index].content[sc_index].figure != undefined){
                                        md_content += `![](${article[index].content[c_index].subarticle[s_index].content[sc_index].figure})\n\n`;
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

function trans2latex(jsObj){
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
        latex_content += `\\section{${article[index].name}}\n\n`;
        for(var c_index in article[index].content){
            if(article[index].content[c_index].type == "text"){
                latex_content += `${article[index].content[c_index].text}\n\n`;
            }
            // figure 
            if(article[index].content[c_index].figure != "" && article[index].content[c_index].figure != undefined){
                latex_content += `\\includegraphics[width=\\textwidth]{${article[index].content[c_index].figure}}\n\n`;
            }
            // subarticle
            for(var s_index in article[index].content[c_index].subarticle){
                latex_content += `\\subsection{${article[index].content[c_index].subarticle[s_index].name}}\n\n`;
                for(var sc_index in article[index].content[c_index].subarticle[s_index].content){
                    if(article[index].content[c_index].subarticle[s_index].content[sc_index].type == "text"){
                        latex_content += `${article[index].content[c_index].subarticle[s_index].content[sc_index].text}\n\n`;
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

// module.exports = docogen;