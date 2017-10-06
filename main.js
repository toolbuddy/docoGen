const latex = require('node-latex-pdf');
const rs = require('randomstring');
const mdpdf = require('mdpdf');
const fsx = require('fs-extra');
const fh = require("filehound");
const path = require('path');
const fs = require('fs');
const os = require('os');

const engine = require('./lib/docogen-engine');
const docogen = {};

docogen.generate_latexpdf = function(src,dest,options,cb){
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
                let output = `${options.output}.tex` || `${rs.generate(5)}-${fname}.tex`;
                fs.writeFileSync(`${os.tmpdir()}/${output}`,engine.trans2latex(JSON.parse(fs.readFileSync(files[0],'utf-8'))));
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
                let output = `${options.output}.tex` || `${rs.generate(5)}-merginglatex.tex`;
                // merging
                fs.writeFileSync(`${os.tmpdir()}/${output}`,engine.trans2latex(this.merge_docogen(files)));
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

docogen.generate_mdpdf = function(src,dest,options,cb){
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
                fs.writeFileSync(os.tmpdir()+'/'+output+'.md',engine.trans2md(JSON.parse(fs.readFileSync(files[0],'utf-8'))));
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
                fs.writeFileSync(os.tmpdir()+'/'+output+'.md',engine.trans2md(this.merge_docogen(files)));
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

docogen.merge_docogen = function(src_arr,options){
    // here comes the files list
    let jsobj = {};
    console.log("Have " + src_arr.length + " files.");
    let opt = options || false;
    if(opt.detail){
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

module.exports = docogen;