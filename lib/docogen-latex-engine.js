const rs = require('randomstring');
const mdpdf = require('mdpdf');
const fsx = require('fs-extra');
const fh = require("filehound");
const path = require('path');
const fs = require('fs');
const os = require('os');

const utils = require('./docogen-util');
const gviz = require('./docogen-graphviz')
const latex_engine = {};

latex_engine.trans2latex = function(jsObj){
    let title = jsObj.title;
    let options = jsObj.options;
    let author = jsObj.author; // js array
    let abs = jsObj.abstract; // js obj
    let article = jsObj.article; // js array
    let ref = jsObj.reference; // js array
    // init
    let latex_content = `\\documentclass{${options.type}}\n`;
    // setting package
    if(os.type() == "Windows_NT"){
        latex_content += `\\usepackage{graphicx}\n\\graphicspath{{}}\n\n\
        \\usepackage{CJKutf8}\n\
        \\usepackage[table]{xcolor}\n\
        \\usepackage[utf8]{inputenc}\n\
        \\usepackage{multirow}\n\
        \\usepackage{float}\n\
        \\usepackage{listings}\n\
        \\usepackage{color}\n\
        \\usepackage{tcolorbox}\n\
        \\tcbuselibrary{skins, breakable, theorems}\n\
        \n\n`;
    }
    else{
        // without chinese support
        latex_content += `\\usepackage{graphicx}\n\\graphicspath{{}}\n\n\
        \\usepackage[table]{xcolor}\n\
        \\usepackage[utf8]{inputenc}\n\
        \\usepackage{multirow}\n\
        \\usepackage{float}\n\
        \\usepackage{listings}\n\
        \\usepackage{color}\n\
        \\usepackage{tcolorbox}\n\
        \\tcbuselibrary{skins, breakable, theorems}\n\
        \n\n`;
    }
    // setting the code listing style
    latex_content += `\\definecolor{mygreen}{rgb}{0,0.6,0}\n\
        \\definecolor{mygray}{rgb}{0.5,0.5,0.5}\n\
        \\definecolor{mymauve}{rgb}{0.58,0,0.82}\n\n\
        \\lstset{ %\n\
        \tbackgroundcolor=\\color{white},\n\
        \tbasicstyle=\\footnotesize,        % the size of the fonts that are used for the code\n\
        \tbreakatwhitespace=false,         % sets if automatic breaks should only happen at whitespace\n\
        \tbreaklines=true,                 % sets automatic line breaking\n\
        \tcaptionpos=b,                    % sets the caption-position to bottom\n\
        \tcommentstyle=\\color{mygreen},    % comment style\n\
        \tdeletekeywords={...},            % if you want to delete keywords from the given language\n\
        \tescapeinside={\\%*}{*)},          % if you want to add LaTeX within your code\n\
        \textendedchars=true,              % lets you use non-ASCII characters; for 8-bits encodings only, does not work with UTF-8\n\
        \tframe=single,	                   % adds a frame around the code\n\
        \tkeepspaces=true,                 % keeps spaces in text, useful for keeping indentation of code (possibly needs columns=flexible)\n\
        \tkeywordstyle=\\color{blue},       % keyword style\n\
        \tlanguage=Octave,                 % the language of the code\n\
        \tmorekeywords={*,...},            % if you want to add more keywords to the set\n\
        \tnumbers=left,                    % where to put the line-numbers; possible values are (none, left, right)\n\
        \tnumbersep=5pt,                   % how far the line-numbers are from the code\n\
        \tnumberstyle=\\tiny\\color{mygray}, % the style that is used for the line-numbers\n\
        \trulecolor=\\color{black},         % if not set, the frame-color may be changed on line-breaks within not-black text (e.g. comments (green here))\n\
        \tshowspaces=false,                % show spaces everywhere adding particular underscores; it overrides 'showstringspaces'\n\
        \tshowstringspaces=false,          % underline spaces within strings only\n\
        \tshowtabs=false,                  % show tabs within strings adding particular underscores\n\
        \tstepnumber=1,                    % the step between two line-numbers. If it's 1, each line will be numbered\n\
        \tstringstyle=\\color{mymauve},     % string literal style\n\
        \ttabsize=2,	                   % sets default tabsize to 2 spaces\n\
        \ttitle=\\lstname                   % show the filename of files included with \\lstinputlisting; also try caption instead of title\n\
        }\n\
        \n\n`;

    // setting table style
    latex_content += `\\setlength{\\arrayrulewidth}{1mm}\n\
        \\setlength{\\tabcolsep}{18pt}\n\
        \\renewcommand{\\arraystretch}{1.5}\n\
        \n\n`;
    // begin tag
    latex_content += `\\begin{document}\n\n`;
    // concat title 
    latex_content += `\\title{${title}}\n\n`;
    // concat author
	latex_content += `\\author{ `;
    for(var index in author){
		// append author
		latex_content += `${author[index].name}\\\\ `;
        latex_content += (author[index].email != undefined ? `${author[index].email}\\\\ ` : "");
        latex_content += (author[index].org != undefined ? `\\textbf{\\textit{${author[index].org}}}\\\\ ` : "");
		// latex_content += (author[index].phone != undefined ? `${author[index].phone}\\\\ ` : "");
		// latex_content += (author[index].website != undefined ? `${author[index].website}\\\\ ` : "");
		// prepare 
		if(index != (author.length-1)) latex_content += ` \\and `
    }
	latex_content += `}\n`;
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
                    concater += `${items[index].content[c_index].name}\n\\begin{itemize}\n\n`;
                    for(var t_index in items[index].content[c_index].data){
                        concater += `\\item ${items[index].content[c_index].data[t_index].info}\\\\\n`
                    }
                    concater += `\\end{itemize}\n`;
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
                case "table":
                    // construct table title
                    concater += `\\begin{tabular}{ |`;
                    for(var i=0;i<items[index].content[c_index].data.length;i++){
                        concater += `p{3cm}|`
                    }
                    concater += ` }\n\\hline\n`;
                    concater += `\\multicolumn{${items[index].content[c_index].data.length}}{|c|}{${items[index].content[c_index].name}} \\\\\n\n`
                    // add column 
                    let column_title = [];
                    let row_obj = [];
                    for(var d_index in items[index].content[c_index].data){
                        // push title
                        column_title.push(items[index].content[c_index].data[d_index].title);
                        // create row object
                        for(var v_index in items[index].content[c_index].data[d_index].value){
                            // insert by index (reverse)
                            row_obj.push(items[index].content[c_index].data[d_index].value[v_index]);
                        }
                    }
                    // generate column title
                    concater += `\\hline\n`;
                    for(var i in column_title){
                        if(i != 0) concater += `&`;
                        concater += `${column_title[i]}`;
                    }
                    concater += `\\\\\n`;
                    // generate column value
                    concater += `\\hline\n`;
                    for(var i=0;i<(row_obj.length/items[index].content[c_index].data.length);i++){
                        for(var j=0;j<items[index].content[c_index].data.length;j++){
                            if(j != 0) concater += `&`;
                            concater += `${row_obj[i+j*(row_obj.length/items[index].content[c_index].data.length)]}`;
                        }
                        concater += `\\\\\n`
                    }
                    concater += `\\hline\n`;
                    concater += `\\end{tabular}\n\n`;
                break;
                case "formula": 
                    concater += `${items[index].content[c_index].name}\n\n`;
                    for(var t_index in items[index].content[c_index].data){
                        if(items[index].content[c_index].data[t_index].info != undefined){
                            concater += `${items[index].content[c_index].data[t_index].info}\n`;
                        }
                        if(items[index].content[c_index].data[t_index].inline != undefined){
                            // stripping (Test for non-latex format)
                            // items[index].content[c_index].data[t_index].inline = utils.strip_latex_format(items[index].content[c_index].data[t_index].inline,'\\(','\\)')
                            concater += `${items[index].content[c_index].data[t_index].inline}\n`;
                        }
                        if(items[index].content[c_index].data[t_index].display != undefined){
                            // stripping (Test for non-latex format)
                            // items[index].content[c_index].data[t_index].display = utils.strip_latex_format(items[index].content[c_index].data[t_index].display,'\\[','\\]');
                            concater += `${items[index].content[c_index].data[t_index].display}\n`;
                        }
                        if(items[index].content[c_index].data[t_index].equation != undefined){
                            concater += `\n\\begin{equation}\n${items[index].content[c_index].data[t_index].equation}\n\\end{equation}\n`;
                        }
                    }
                    concater += `\n`;
                break;
                case "code":
                    concater += `${items[index].content[c_index].name}\n\n`;
                    for(var t_index in items[index].content[c_index].data){
                        concater += `\\begin{lstlisting}[language=${items[index].content[c_index].data[t_index].lang}, caption=${items[index].content[c_index].data[t_index].caption}]\n`;
                        if(items[index].content[c_index].data[t_index].src != undefined){
                            // read from file
                            let raw = fs.readFileSync(items[index].content[c_index].data[t_index].src,'utf-8');
                            concater += `${raw}\n`;
                        }
                        else if(items[index].content[c_index].data[t_index].raw != undefined){
                            concater += `${items[index].content[c_index].data[t_index].raw}\n`;
                        }
                        concater += `\\end{lstlisting}\n\n`;
                    }
                break;
                case "figure":
                    concater += `${items[index].content[c_index].name}\n\n`;
                    for(var t_index in items[index].content[c_index].data){
                        if(items[index].content[c_index].data[t_index].path != ""){
                            if(items[index].content[c_index].data[t_index].size == "") items[index].content[c_index].data[t_index].size = 1;
                            // legal path
                            concater += `\\begin{figure}[H]\n\\begin{${items[index].content[c_index].data[t_index].align}}\n`;
                            concater += `\\includegraphics[width=${items[index].content[c_index].data[t_index].size}\\textwidth]{${items[index].content[c_index].data[t_index].path}}\n`;
                            concater += `\\caption{${items[index].content[c_index].data[t_index].caption}}\n`;
                            concater += `\\end{${items[index].content[c_index].data[t_index].align}}\n\\end{figure}\n\n`;
                        }
                    }
                break;
                case "web-restful-api":
                    concater += `${items[index].content[c_index].name}\n\n`;
                    for(var t_index in items[index].content[c_index].data){
                        concater += `\\begin{tcolorbox}[title={${items[index].content[c_index].data[t_index].usage}}]\n`;
                        concater += `\\textbf{Method:} ${items[index].content[c_index].data[t_index].method}\\\\\n`
                        concater += `\\textbf{Url:} ${items[index].content[c_index].data[t_index].url}\\\\\n`
                        concater += `\\textbf{Description:} ${items[index].content[c_index].data[t_index].description}\\\\\n`
                        // Add table for field -> append table
                        concater += `\\textbf{Parameter:}\\\\\n`;
                        concater += `\\begin{center}\n\\begin{tabular}{ | l | r | }\n`
                        concater += `\\hline\n`
                        concater += `\\textbf{Field Name} & \\textbf{Data Type} \\\\\n`
                        concater += `\\hline\n`
                        for(var f_index in items[index].content[c_index].data[t_index].field){
                            concater += `${items[index].content[c_index].data[t_index].field[f_index].name} & ${items[index].content[c_index].data[t_index].field[f_index].type}\\\\\n`
                        }
                        concater += `\\hline\n`
                        concater += `\\end{tabular}\\end{center}\n`
                        // message 
                        concater += `\\tcblower\n`
                        concater += `\\textbf{Error Msg:}`
                        for(var e_index in items[index].content[c_index].data[t_index].error){
                            concater += ' '+ items[index].content[c_index].data[t_index].error[e_index];
                        }
                        concater += `\n\\\\\n`
                        concater += `\\textbf{Success Msg:}`
                        for(var e_index in items[index].content[c_index].data[t_index].success){
                            concater += ' ' + items[index].content[c_index].data[t_index].success[e_index];
                        }

                        // end 
                        concater += `\n\\end{tcolorbox}`;
                    }
                break;
                case "graphviz":
                    concater += `${items[index].content[c_index].name}\n\n`;
                    for(var t_index in items[index].content[c_index].data){
                        if(items[index].content[c_index].data[t_index].src != undefined && items[index].content[c_index].data[t_index].src != ""){
                            if(items[index].content[c_index].data[t_index].size == "") items[index].content[c_index].data[t_index].size = 1;
                            // generate from file
                            let result = 'drawFile-'+rs.generate(12).toString();
                            gviz.drawFile(items[index].content[c_index].data[t_index].src,{output:result,dest:os.tmpdir(),type:'png'},(err,msg) => {
                                if(err)
                                    console.log(msg)
                                else{
                                    console.log(`Result image: ${msg.result}\n\n`)
                                }
                            });
                            // Append the filename on it
                            concater += `\\begin{figure}[H]\n\\begin{${items[index].content[c_index].data[t_index].align}}\n`;
                            if(os.type() == "Windows_NT"){
                                concater += `\\includegraphics[width=${items[index].content[c_index].data[t_index].size}\\textwidth]{${path.join(os.tmpdir(),result+'.png').replace(/\\/g,'/')}}\n`;
                            }
                            else{
                                concater += `\\includegraphics[width=${items[index].content[c_index].data[t_index].size}\\textwidth]{${path.join(os.tmpdir(),result+'.png')}}\n`;
                            }
                            concater += `\\caption{${items[index].content[c_index].data[t_index].caption}}\n`;
                            concater += `\\end{${items[index].content[c_index].data[t_index].align}}\n\\end{figure}\n\n`;
                        }
                        else if(items[index].content[c_index].data[t_index].raw != ""){
                            // draw from raw
                            let result = 'drawFile-'+rs.generate(12).toString();
                            gviz.drawRaw(items[index].content[c_index].data[t_index].raw,{output:result,dest:os.tmpdir(),type:'png'},(err,msg) => {
                                if(err)
                                    console.log(msg)
                                else{
                                    if(err)
                                        console.log(msg)
                                    else{
                                        console.log(`Temp file: ${msg.tmpf}\nResult image: ${msg.result}\n\n`)
                                    }
                                }
                            })
                            // Append the filename on it
                            concater += `\\begin{figure}[H]\n\\begin{${items[index].content[c_index].data[t_index].align}}\n`;
                            if(os.type() == "Windows_NT"){
                                concater += `\\includegraphics[width=${items[index].content[c_index].data[t_index].size}\\textwidth]{${path.join(os.tmpdir(),result+'.png').replace(/\\/g,'/')}}\n`;
                            }
                            else{
                                concater += `\\includegraphics[width=${items[index].content[c_index].data[t_index].size}\\textwidth]{${path.join(os.tmpdir(),result+'.png')}}\n`;
                            }
                            concater += `\\caption{${items[index].content[c_index].data[t_index].caption}}\n`;
                            concater += `\\end{${items[index].content[c_index].data[t_index].align}}\n\\end{figure}\n\n`;    
                        }
                    }
                break;
                default:
                    // not match
                break;
            }
            // figure part
            if(items[index].content[c_index].figure != undefined){
                for(var f_index in items[index].content[c_index].figure){
                    if(items[index].content[c_index].figure[f_index].path != ""){
                        if(items[index].content[c_index].figure[f_index].size == "") items[index].content[c_index].figure[f_index].size = 1;
                        // legal path
                        concater += `\\begin{figure}[H]\n\\begin{${items[index].content[c_index].figure[f_index].align}}\n`;
                        concater += `\\includegraphics[width=${items[index].content[c_index].figure[f_index].size}\\textwidth]{${items[index].content[c_index].figure[f_index].path}}\n`;
                        concater += `\\caption{${items[index].content[c_index].figure[f_index].caption}}\n`;
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

module.exports = latex_engine;
