var utils = require('./utils.js');
var q = require('q');
var lo = require('lodash');
var fs = require('fs');
var path = require('path');
var cloudinary = require('cloudinary');

var files = [];

/**
 * Sets up the command space
 * @returns {Promise} A promise for when setup is complete
 */
function setup() {
	var deferred = q.defer();
	var errors = [];

	cloudinary.config({
		cloud_name: global.config.cloud_name,
		api_key: global.config.api_key,
		api_secret: global.config.api_secret
	});

	lo.each(global.config.args, function (fname) {
		var fstats;

		try {
			fstats = fs.lstatSync(fname);
			if (fstats.isFile()) {
				files.push(fname);
				return;
			}
		} catch (error) {
			console.log(error);
		}

		try {
			var fpath = path.join(process.cwd(), fname);
			fstats = fs.lstatSync(fpath);

			if (fstats.isFile()) {
				files.push(fpath);
			} else {
				errors.push(new Error(fname + ' is not a valid file'));
			}
		} catch (cwd_error) {
			errors.push(new Error(fname + ' is not a valid file'));
		}
	});

	if (lo.isEmpty(errors)) {
		deferred.resolve();
	} else {
		deferred.reject(errors);
	}

	return deferred.promise;
}

/**
 * Uploads a file
 * @param {String} file The file path
 * @returns {Promise} A promise for when the file is uploaded
 */
function upload_file(file) {
	var deferred = q.defer();

	cloudinary.uploader.upload(file, function (result) {
		deferred.resolve({
			fname: file,
			url: result.url
		});
	});

	return deferred.promise;
}

/**
 * Uploads multiple files
 * @returns {Promise} A promise for when all the files have been uploaded
 */
function upload_files() {
	var deferred = q.defer();
	var promises = [];

	lo.each(files, function (file) {
		promises.push(upload_file(file));
	});

	q.allSettled(promises)
		.then(function (results) {
			results.forEach(function (result) {
				if (result.state === 'fulfilled') {
					console.log(result.value.fname + ' => ' + result.value.url);
				} else {
					console.log(result.reason);
				}
			});

			deferred.resolve();
		});

	return deferred.promise;
}

/**
 * Runs all the code
 * @returns {undefined}
 */
function run() {
	q.fcall(utils.setup)
		.then(setup)
		.then(upload_files)
		.catch(function (error) {
			console.log(error);
		});
}

var cli = {	run: run };

module.exports = cli;