var path = require("path");
var fs = require("fs");
var async = require("async");
var Stream = require("./stream.js");

module.exports = function(files,opts,cb){
    opts = opts||{};
    opts.name = opts.name || "resources";
    opts.dir = opts.dir||"./";
    
    var outputDir = path.resolve(process.cwd(),opts.dir);
    var header = fs.createWriteStream(path.resolve(outputDir,"./"+opts.name+".h"));
    var source = fs.createWriteStream(path.resolve(outputDir,"./"+opts.name+".cpp"));

    header.write("#pragma once\n\nnamespace resgen{\n\n");
    source.write("#include <Resource.h>\n\nnamespace resgen{\n\n");
    
    async.eachSeries(files,function(file,cb){
        if(!fs.statSync(file).isFile()) return cb();
        var name = path.basename(file,path.extname(file));
        header.write("extern Resource "+name+";\n");
        var stream = new Stream(name);
        fs.createReadStream(file).pipe(stream).pipe(source,{end:false});
        stream.on("end",cb);
    },function(){
        header.end("\n}\n");
        source.end("\n}\n");
        if(cb) cb();
    });
}