/*jslint browser: false, regexp: true */
/*global console, global, module, process, require */

var utils = require('./utils.js'),
	q = require('q');

function main() {
	'use strict';
}

function run() {
	'use strict';

	q.fcall(utils.setup)
		.then(main)
		.catch(function (error) {
			console.log(error);
		});
}

var cli = {
	run: run
};

module.exports = cli;