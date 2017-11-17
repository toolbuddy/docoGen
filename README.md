# docoGen
[![npm version](https://badge.fury.io/js/docogen.svg)](https://badge.fury.io/js/docogen)
[![npm downloads](https://img.shields.io/npm/dm/docogen.svg)](https://img.shields.io/npm/dm/docogen.svg)
[![](https://data.jsdelivr.com/v1/package/npm/docogen/badge)](https://www.jsdelivr.com/package/npm/docogen)

A document generation tool within your masterpiece.
* The coverage :
   - [x] Convert to Latex pdf (latest support, work in progress)
   - [x] Convert to Markdown pdf (deprecate currently)
   - [x] Convert to html (latest support, work in progress)
      - please import package: [`docoGen-webui`](https://github.com/toolbuddy/docoGen-WebUI.git)
      - currently need to clone the source code to use

# [See More in Wiki](https://github.com/toolbuddy/docogen/wiki)
* Contain the latest support and usage explanation.

# Prerequisite
* Dependencies of `node-latex-pdf`. (need to install `MiKTeX` to generate LaTeX document)
  * You can use `install_dep.sh` or `install_dep.bat` to install dependencies
* Using the file extension which named `.docogen`, and just store json format in it.
  * these files treated as configuration dependency to your generated result.
  * More information (Still working on it, see `test/script/` to see current support)
* **New feature**: support `markdown` format!
  * After version `0.1.0`, you can now edit `.md` to writing docoGen!
  * System will transform markdown to docoGen format.
  * See the example in `test/md_script/example.md`
  * More detail information will be append on docoGen wiki.
* Within docogen running, `MikTex` will asked you to install multiple required package with docogen.
  * It will **takes minutes** to complete the packages dependency installation.
  * For `Window` user, if you install MikTeX with option `each install will be notified`, then the first setup will pop out several windows to ask for permission. This is the docoGen format dependencies, It's safety to let it installed.

# Usage
## For Developer
* Git clone with submodule
  * It will clone the example scripts
```bash
git clone --recursive https://github.com/toolbuddy/docoGen.git
```
## For User
* Install
```bash
npm install docogen --save
```

* Example: Generate LaTeX pdf from docoGen script
  * `src_path`: the source path to your project root, and it will get all docogen files.
  * `dest_path`: the destination directory to store those generated pdf.
  * `options`: the user-defined go here. (JSON object format)
    * `output`: specify the output pdf filename.
```js
const docogen = require('docogen');

// convert docogen to latex (pdf format), with absolute path
docogen.generate_latexpdf( src_path , dest_path , options ,(err,msg)=>{
    console.log(msg);
});
```

* See all current support method in `test/`! Enjoy!

# Author
* [Kevin Cyu](https://kevinbird61.github.io/Intro/), kevinbird61@gmail.com
