var config_vars = [
	'api_key',
	'api_secret',
	'args',
	'cloud_name'
];

var commander = require('commander');
var fs = require('fs');
var path = require('path');
var q = require('q');
var lo = require('lodash');
var pkg = require('../package.json');

/**
 * Gets the user's home path
 * @returns {String} The user's home path
 */
function getUserHome() {
	return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
}

/**
 * Loads the config from disk
 * @return {Promise} A promise for when the config has been loaded
 */
function load_config() {
	var deferred = q.defer();

	fs.readFile(path.join(getUserHome(), '.cloudinary'), function (error, data) {
		if (error) {
			if (error.code === 'ENOENT') {
				deferred.resolve();
			} else {
				deferred.reject(error);
			}
		} else {
			global.config = JSON.parse(data);
			deferred.resolve();
		}
	});

	return deferred.promise;
}

/**
 * Starts the command and parses the command line parameters
 * @returns {Promise} A promise for when the command has been started
 */
function start() {
	var deferred = q.defer();

	if (global.config === undefined) {
		global.config = {};
	}

	global.program = new commander.Command();

	global.program.option('-n, --cloud_name [cloud_name]', 'Cloudinary cloud name')
		.option('-k, --api_key [api_key]', 'Cloudinary api key')
		.option('-s, --api_secret [api_secret]', 'Cloudinary api secret')
		.command('upload <file> [file]', 'upload an image')
		.version(pkg.version)
		.parse(process.argv);

	lo.each(config_vars, function (key) {
		if (lo.get(global.program, key) !== undefined) {
			lo.set(global.config, key, lo.get(global.program, key));
		}
	});

	deferred.resolve();

	return deferred.promise;
}

/**
 * Sets up the command
 * @returns {Promise} A promise for when the setup has completed
 */
function setup() {
	var deferred = q.defer();

	q.fcall(load_config)
		.then(start)
		.then(function () {
			deferred.resolve();
		})
		.catch(function (error) {
			deferred.reject(error);
		});

	return deferred.promise;
}

var utils = { setup: setup };

module.exports = utils;