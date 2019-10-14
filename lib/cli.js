var utils = require('./utils.js');
var q = require('q');

/**
 * The main function
 * @returns {undefined}
 */
function main() {}

/**
 * The run method
 * @returns {undefined}
 */
function run() {
	q.fcall(utils.setup)
		.then(main)
		.catch(function (error) {
			console.log(error);
		});
}

var cli = {	run: run };

module.exports = cli;