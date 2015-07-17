'use strict';

var should = require('chai').should(),
	expect = require('chai').expect,
	linker = require('../index');

describe('indexTest', function() {


	beforeEach(function() {
		// TODO: delete all created symlinks
	});

	it('#link(): should add a symlink for each directory (module) name specified in options.modules', function() {
		// TODO: add symlinks for module_one and module_two directory to mock_node_modules
	});

	it('#link(): should add no symlinks if no directories (modules) are specified in options.modules', function() {
		// TODO: add symlinks for module_one and module_two directory to mock_node_modules
	});

});