/**
 *
 */
'use strict';

var _ = require('underscore'),
	path = require('path'),
	fs = require('fs');

function createSymlinkIfNotExists(module, modulePath, symlinkNodeModulesPath, exists) {
	if(!exists) {
		fs.symlink(modulePath, symlinkNodeModulesPath, 'file', function(err) {
			if(err) {
				console.log("Error creating symlink for module '" + module + "'! " + err);
			} else {
				console.log("Symlink for module '" + module + "' created.");
			}
		});
	} else {
		console.log("Symlink for module '" + module + "' already exists. No op.");
	}
} 

module.exports = {

	/**
	 * 
	 * @param {Object} options
	 * @param {Array} options.modules
	 * @param {String} options.symlinkPrefix
	 * @param {String} options.nodeModulesPath
	 */
	link: function(options) {
		var module,
			modulePath,
			symlinkNodeModulesPath,
			i;

		for(i = 0; i < options.modules.length; i++) {
			module = options.modules[i];
			// The actual path to the file
			modulePath = path.join(__dirname, module);
			// The path to the symlink under the node_modules directory
			symlinkNodeModulesPath = path.join(__dirname, options.nodeModulesPath, options.symlinkPrefix + module);

			fs.exists(symlinkNodeModulesPath, _.bind(createSymlinkIfNotExists, this, module, modulePath, symlinkNodeModulesPath));
		}
	}

};