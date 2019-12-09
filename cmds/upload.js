var chalk = require('chalk');
var lodash = require('lodash');
var q = require('q');

var utils = require('../lib/utils');

/** The name of the subcommand */
var COMMAND_NAME = 'upload';

/** The description of the subcommand */
var COMMAND_DESC = 'Upload an image';

/** The name of the parameters */
var COMMAND_PARAM = 'files';

/** The command line options for this subcommand */
var OPTIONS = {
	folder: {
		describe: 'The folder',
		type: 'string',
		alias: 'f'
	},
	unique: {
		describe: 'When true ensures the filename is unique by appending a hash if `usefilename` is true, otherwise uses a hash as the file name. Defaults to true.',
		type: 'boolean',
		alias: 'u'
	},
	usefilename: {
		describe: 'Use the system filename',
		type: 'boolean'
	}
};

/** Maps the command line options to the cloudinary upload options */
var OPTION_MAP = {
	folder: 'folder',
	unique: 'unique_filename',
	usefilename: 'use_filename'
};

/**
 * Prints the results out for the user
 * @param {Object[]} results The results
 * @returns {Promise} A promise for when all the results are printed
 */
function print(results) {
	var deferred = q.defer();

	lodash.each(results, function (result) {
		var output = result.success ? result.file_path + ' ⇨ ' + result.url : result.reason;
		console.log(result.success ? chalk.green(output) : chalk.red(output));
	});

	deferred.resolve();

	return deferred.promise;
}

/**
 * Adds additional options to the yargs
 * @param {Object} yargs The yargs instance
 * @returns {Object} the updated yargs
 */
function builder(yargs) {
	return yargs.options(OPTIONS).array(COMMAND_PARAM);
}

/**
 * The handler
 * @param {Object} argv The arguments
 * @returns {undefined}
 */
function handler(argv) {
	utils.credentials(argv)
		.then(function (credentials) {
			var files = lodash.concat(argv.files, lodash.pull(argv._, COMMAND_NAME));
			var config = {
				cloudinary: utils.cloudinary(credentials),
				options: {}
			};

			lodash.each(lodash.keys(OPTIONS), function (option) {
				var value = lodash.get(argv, option);
				var config_key = lodash.get(OPTION_MAP, option);
				if (value !== undefined) {
					lodash.set(config.options, config_key, value);
				}
			});

			utils.upload_files(files, config)
				.then(print)
				.catch(function (error) {
					console.log(error);
				});
		}).catch(function (error) {
			console.log(error);
		});
}

exports.command = COMMAND_NAME + ' [' + COMMAND_PARAM + ']';
exports.desc = COMMAND_DESC;
exports.builder = builder;
exports.handler = handler;