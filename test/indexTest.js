'use strict';

var should = require('chai').should(),
	expect = require('chai').expect,
	linker = require('../index'),
	fs = require('fs'),
	path = require('path');

describe('indexTest', function() {

	var symlinkModules,
		noSymlinkModules,
		nodeModulePath,
		symlinkPrefix;

	symlinkModules = ['module_one', 'module_three'];
	noSymlinkModules = ['module_two'];
	nodeModulePath = './mock_node_modules';
	symlinkPrefix = '@';

	function constructNodeModuleSymlinkPath(module) {
		return path.join(nodeModulePath, symlinkPrefix + module);
	}

	/**
	 * Asserts that all symlinkModules have a symlink that exists.
	 */
	function assertSymlinksExist(modules) {
		var i;

		for(i = 0; i < modules.length; i++) {
			expect(fs.existsSync(modules[i])).to.be.true;
		}
	}

	/**
	 * Asserts that no symlinks exist in the nodeModulePath.
	 */
	function assertNoSymLinksExist(modules) {
		var exists,
			i;

		for(i = 0; i < modules.length; i++) {
			exists = fs.existsSync(constructNodeModuleSymlinkPath(modules[i]));
			expect(exists).to.be.false;
		}
	}


	beforeEach(function() {
		// TODO: delete all created symlinks
	});

	it('#link(): should add a symlink for each directory (module) name specified in options.modules', function() {
		// TODO: add symlinks for module_one and module_two directory to mock_node_modules
	});

	it('#link(): should add no symlinks if no directories (modules) are specified in options.modules', function() {
		assertNoSymLinksExist(symlinkModules.concat(noSymlinkModules));
	});

});