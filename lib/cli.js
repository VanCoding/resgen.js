#!/usr/bin/env node
var minimist = require("minimist");
var args = minimist(process.argv.slice(2));

var resgen = require("./index.js");
resgen(args._,{dir:args.dir,name:args.name},function(){});