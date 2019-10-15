var fs = require('fs');
var path = require('path');
var q = require('q');
var lodash = require('lodash');

var GLOBAL_OPTIONS = {
	cloud_name: {
		describe: 'The Cloudinary cloud name',
		type: 'string',
		alias: 'n'
	},
	api_key: {
		describe: 'The Cloudinary api key',
		type: 'string',
		alias: 'k'
	},
	api_secret: {
		describe: 'The Cloudinary api secret',
		type: 'string',
		alias: 's'
	}
};

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
				deferred.resolve({});
			} else {
				deferred.reject(error);
			}
		} else {
			deferred.resolve(JSON.parse(data));
		}
	});

	return deferred.promise;
}

/**
 * Checks the file
 * @param {String} file The file path
 * @returns {Promise} A promise for when file has been checked
 */
function check_file(file) {
	var deferred = q.defer();

	var file_stats;

	try {
		file_stats = fs.lstatSync(file);
		if (file_stats.isFile()) {
			deferred.resolve(file);
			return deferred.promise;
		}
	} catch (error) {
		// Ignore this error we'll try to get a better path later
	}

	try {
		var file_path = path.join(process.cwd(), file);
		file_stats = fs.lstatSync(file_path);

		if (file_stats.isFile()) {
			deferred.resolve(file_path);
		} else {
			deferred.reject(new Error(file + ' is not a valid file'));
		}
	} catch (cwd_error) {
		deferred.reject(new Error(file + ' is not a valid file'));
	}

	return deferred.promise;
}

/**
 * Uploads a file
 * @param {String} file The file path
 * @param {Object} options The options for uploading the file
 * @param {Object} cloudinary The cloudinary instance to use
 * @returns {Promise} A promise for when the file is uploaded
 */
function upload_file(file, options, cloudinary) {
	var deferred = q.defer();

	check_file(file)
		.then(function (file_path) {
			cloudinary.v2.uploader.upload(file_path, options, function (error, result) {
				if (error) {
					deferred.reject(error);
				} else {
					deferred.resolve({
						file_path: file_path,
						url: result.url
					});
				}
			});
		}).catch(function (error) {
			deferred.reject(error);
		});

	return deferred.promise;
}

/**
 * Uploads multiple files
 * @param {String[]} files An array of file paths
 * @param {Object} config The config for uploading the file
 * @returns {Promise} A promise for when all the files have been uploaded
 */
function upload_files(files, config) {
	var deferred = q.defer();
	var promises = [];
	var upload_results = [];

	lodash.each(files, function (file) {
		promises.push(upload_file(file, config.options, config.cloudinary));
	});

	q.allSettled(promises)
		.then(function (results) {
			results.forEach(function (result) {
				if (result.state === 'fulfilled') {
					upload_results.push({
						success: true,
						file_path: result.value.file_path,
						url: result.value.url
					});
				} else {
					upload_results.push({
						success: false,
						reason: result.reason.message
					});
				}
			});

			deferred.resolve(upload_results);
		});

	return deferred.promise;
}

/**
 * Gets the credentials from file and augments them with the argv
 * @param {Object} argv The arguments
 * @returns {Promise} A promise for the credentials
 */
function getCredentials(argv) {
	var deferred = q.defer();

	load_config()
		.then(function (data) {
			lodash.each(lodash.keys(GLOBAL_OPTIONS), function (option) {
				if (lodash.get(argv, option) !== undefined) {
					lodash.set(data, option, lodash.get(argv, option));
				}
			});

			deferred.resolve(data);
		}).catch(function (error) {
			deferred.reject(error);
		});

	return deferred.promise;
}

/**
 * Gets an instance of cloudinary
 * @param {Object} credentials The credentials for cloudinary
 * @returns {Object} An instance of cloundinary to use
 */
function cloudinary(credentials) {
	var cloudinary = require('cloudinary'); // eslint-disable-line global-require
	cloudinary.config(credentials);
	return cloudinary;
}

var utils = {
	GLOBAL_OPTIONS: GLOBAL_OPTIONS,
	cloudinary: cloudinary,
	credentials: getCredentials,
	load_config: load_config,
	upload_files: upload_files
};

module.exports = utils;