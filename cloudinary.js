#!/usr/bin/env node

var yargs = require('yargs');
var utils = require('./lib/utils');

yargs
	.options(utils.GLOBAL_OPTIONS)
	.commandDir('cmds')
	.demandCommand()
	.help()
	.argv;