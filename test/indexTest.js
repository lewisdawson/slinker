'use strict';

var should = require('chai').should(),
	expect = require('chai').expect,
	slinker = require('../index'),
	fs = require('fs'),
	path = require('path'),
	glob = require('glob'),
	_ = require('underscore');

describe('indexTest', function() {

	var symlinkModules,
		noSymlinkModules,
		nodeModulesPath,
		symlinkPrefix,
		modulesBasePath;

	modulesBasePath = __dirname;
	symlinkModules = ['module_one', 'module_three'];
	noSymlinkModules = ['module_two'];
	nodeModulesPath = path.join(modulesBasePath, 'mock_node_modules');
	symlinkPrefix = '@';

	function constructNodeModuleSymlinkPath(module) {
		return path.join(nodeModulesPath, symlinkPrefix + module);
	}

	/**
	 * @parameter path
	 *			The path on the file system of the symlink
	 * @return true if the parameter symlink path exists, otherwise false
	 */
	function doesSymlinkExist(path) {
		try {
			fs.lstatSync(path);
			return true;
		} catch(err) {
			// The symlink doesn't exist
			return false;
		}
	}

	/**
	 * Asserts that all parameter (symlink) modules exitences are equal to the parameter
	 * exists.
	 */
	function assertSymlinksEqual(symlinkPaths, exists) {
		var path,
			i;

		_.each(symlinkPaths, function(symlinkPath) {
			symlinkPath = constructNodeModuleSymlinkPath(symlinkPath);
			expect(doesSymlinkExist(symlinkPath)).to.equal(exists, 'Expected symlink "' + symlinkPath + '" to ' + (exists ? 'exist, but it doesn\'t' : 'not exist, but it does'));
		});
	}

	/**
	 * Assert that all parameter symlinkPaths exist.
	 *
	 * @param symlinkPaths
	 *			The array of symlink paths to assert
	 */
	function assertSymlinksExist(symlinkPaths) {
		assertSymlinksEqual(symlinkPaths, true);
	}

	/**
	 * Assert that all parameter symlinkPaths do not exist.
	 *
	 * @param symlinkPaths
	 *			The array of symlink paths to assert
	 */
	function assertSymlinksNotExist(symlinkPaths) {
		assertSymlinksEqual(symlinkPaths, false);
	}

	/**
	 * Removes all existing symlinks from the test directory.
	 */
	function removeExistingSymlinks(onComplete) {
		var globPath = path.join(nodeModulesPath, symlinkPrefix + '**'); 

		glob(globPath, function(err, files) {
			_.each(files, function(file) {
				fs.unlinkSync(file);
			});

			onComplete();
		});
	}

	/**
	 * Executed before each test.
	 */
	beforeEach(function(done) {
		var allModules = symlinkModules.concat(noSymlinkModules);
		
		removeExistingSymlinks(function() {
			assertSymlinksNotExist(allModules);

			done();
		});
	});

	it('#link(): should add no symlinks if no directories (modules) are specified in options.modules', function(done) {
		var allModules = symlinkModules.concat(noSymlinkModules);

		slinker.link({
			modules: [],
			modulesBasePath: modulesBasePath,
			symlinkPrefix: symlinkPrefix,
			nodeModulesPath: nodeModulesPath,
			onComplete: function() {
				assertSymlinksNotExist(allModules);

				done();
			},
			onError: function(err) {
				throw Error('Unexpected error occurred while creating symlinks! ' + err);
			}
		});
	});

	it('#link(): should add a symlink for each directory (module) name specified in options.modules', function(done) {
		slinker.link({
			modules: symlinkModules,
			modulesBasePath: modulesBasePath,
			symlinkPrefix: symlinkPrefix,
			nodeModulesPath: nodeModulesPath,
			onComplete: function() {
				assertSymlinksExist(symlinkModules);

				done();
			},
			onError: function(err) {
				throw Error('Unexpected error occurred while creating symlinks! ' + err);
			}
		});
	});

});