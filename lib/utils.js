/*jslint browser: false, regexp: true */
/*global console, global, module, process, require */

var config_vars = [
		'api_key',
		'api_secret',
		'args',
		'cloud_name'
	],
	commander = require('commander'),
	fs = require('fs'),
	path = require('path'),
	q = require('q'),
	lo = require('lodash'),
	pkg = require('../package.json');

function getUserHome() {
	'use strict';

	return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

var load_config = function () {
	'use strict';

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
};

var start = function () {
	'use strict';

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
};

function setup() {
	'use strict';

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

var utils = {
	setup: setup
};

module.exports = utils;