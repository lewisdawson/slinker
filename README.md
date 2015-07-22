## slinker

A simple package used to symlink node module dependencies together. At a high level, slinker takes a list of local node modules (directories) and adds symlinks for each module to the `node_modules` (or equivalent) folder.

## Why??

Symlinking your modules in the `node_modules` directory allows you to avoid relative path hell that you experience on larger node projects. It eliminates the unmaintainable references to modules similar to:

```javascript
var MyObject = require('../../../models/myObject');
```

Instead, with the use of Slinker, you can simply use a module depedency with the follow:

```javascript
var MyObject = require('@models/myObject');
```

## Installation

```bash
$ npm install slinker
```

## Usage

Slinker is ideally used as a build-time tool. It should be invoked through a npm postInstall node application hook.

#### package.json Configuration

In your `package.json`, you can configure a postInstall hook that invokes a simple node application:

```json
"scripts": {
    "postinstall": "node postinstall.js"
  },
```

#### postInstall.js Implementation

Your `postInstall.js` application can invoke Slinker via the `#link()` function:

```javascript
var slinker = require('slinker');

slinker.link({
	modules: ['module_one', 'module_two'],
	modulesBasePath: __dirname,
	symlinkPrefix: '@',
	nodeModulesPath: './node_modules',
	onComplete: function() {
		console.log('Yay, my modules are linked!');
	},
	onError: function(error) {
		console.log('Oh no, my modules aren't linked!');
	}
});
```

## Configuration

Slinker contains a number of configuration parameters that can be used to customize its use. Each parameter can be specified in the Object passed to the `#link()` function.

#### modules

An `Array` of module names that can be found within the `modulesBasePath`.

#### modulesBasePath

The `String` path under which all modules will be searched for. By default, the directory under which slinker is being invoked will be used. If you want the base path to be the current directory of Slinker's invocation, you can use `__dirname`.

#### symlinkPrefix

The `String` prefix used when creating the symlink. By default, the `@` symbol is used.

#### nodeModulesPath

The `String` path of the `node_modules` folder under which the symlinks will be created. By default, the `./node_modules` path is used.

#### onComplete

The `Function` that is invoked when the symlinking has completed. The function is passed _no_ parameters. By default, no function is specified.

#### onError

The `Function` that is invoked when the an error occurs during symlinking. The function is passed a single `error` `String` arg that specifies the error that occurred.

## Tests

To run the tests, install the node dependencies and then invoke `mocha`:

```bash
$ npm install
$ mocha test/indexTest.js
```

## Notes

This has only been tested in OSX so far.