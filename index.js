/**
 *
 */
'use strict';

var _ = require('underscore'),
	path = require('path'),
	fs = require('fs'),
	symlinksCreated = [];

/**
 * @param slinkerOptions
 * @param symlinkConfig.module
 * @param symlinkConfig.modulePath
 * @param symlinkConfig.symlinkNodeModulesPath
 * @param exists
 */
function createSymlinkIfNotExists(slinkerOptions, symlinkConfig, exists) {
	if(!exists) {
		fs.symlink(symlinkConfig.modulePath, symlinkConfig.symlinkNodeModulesPath, 'file', function(err) {
			if(err) {
				console.log("Error creating symlink for module '" + symlinkConfig.module + "'! " + err);
				invokeOnError(slinkerOptions, err);
			} else {
				console.log("Symlink for module '" + symlinkConfig.module + "' created.");
				onSymlinkCreated(slinkerOptions, symlinkConfig.module);
			}
		});
	} else {
		console.log("Symlink for module '" + symlinkConfig.module + "' already exists. No op.");
		onSymlinkCreated(slinkerOptions, symlinkConfig.module);
	}
}

/**
 *
 */
function onSymlinkCreated(slinkerOptions, module) {
	symlinksCreated.push(module);
	invokeOnComplete(slinkerOptions);
}

/**
 * 
 */
function invokeOnComplete(slinkerOptions) {
	if(typeof slinkerOptions.onComplete === 'function' && slinkerOptions.modules.length === symlinksCreated.length) {
		slinkerOptions.onComplete();
	}
}

/**
 *
 */
function invokeOnError(slinkerOptions, error) {
	if(typeof slinkerOptions.onError === 'function') {
		slinkerOptions.onError(error);
	}
}

module.exports = {

	/**
	 * 
	 * @param {Object} options
	 *			An Object that contains the symlinkConfigurations used for symlinking
	 * @param {Array} options.modules
	 *			An array that contains the name of each module (directory) to symlink
	 * @param {String} options.modulesBasePath
	 *			The base path under which all modules that are to be symlinked reside
	 * @param {String} options.symlinkPrefix
	 *			The prefix to use when creating a symlink
	 * @param {String} options.nodeModulesPath
	 *			The path to the node_modules directory where all symlinks will be created
	 * @param {Function} options.onComplete
	 *			A callback that is invoked once all symlinks have been created
	 * @param {Function} options.onError
	 * 			A callback that is invoked if an error occurred while attempting to create a symlink
	 */
	link: function(options) {
		_.each(options.modules, function(module) {
			var modulePath,
				symlinkNodeModulesPath;

			// The actual path to the file
			modulePath = path.join(options.modulesBasePath, module);
			// The path to the symlink under the node_modules directory
			symlinkNodeModulesPath = path.join(options.nodeModulesPath, options.symlinkPrefix + module);

			fs.exists(symlinkNodeModulesPath, _.bind(createSymlinkIfNotExists, this, options, {
				module: module, 
				modulePath: modulePath, 
				symlinkNodeModulesPath: symlinkNodeModulesPath
			}));
		});
	}

};