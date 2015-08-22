## slinker

[![Build Status](https://travis-ci.org/lewisdawson/slinker.svg)](https://travis-ci.org/lewisdawson/slinker)

A simple package used to symlink [Browserify](http://browserify.org/) dependencies as well as node.js submodule dependencies. At a high level, slinker takes a list of local node.js submodules (directories) and adds a symlink for each submodule to the `node_modules` (or equivalent) folder.

## Why??

Symlinking your submodules in the `node_modules` directory allows you to avoid relative path hell that you experience on larger node projects. It eliminates the unmaintainable references to submodules similar to:

```javascript
var MyObject = require('../../../models/myObject');
```

Instead, with the use of Slinker, you can simply use a submodule depedency with the follow:

```javascript
var MyObject = require('@models/myObject');
```

## Isn't That What `npm link` Does?

Not quite. `npm link` is used to link separate node.js modules/packages together. With `npm link`, each module is considered to be a separate dependency by npm. Instead of treating everything like a separate dependency, Slinker allows you to link submodules within your application without having to break them out into separate npm module dependencies. If you're trying to keep your node.js application simple, Slinker reduces the complexity.

## Use It With Browserify!

Slinker also works in conjuction with [Browserify](http://browserify.org/). It can be used to remove your relative paths. See  [here](https://github.com/substack/browserify-handbook#avoiding-) for additional details.

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
var slinker = require('slinker'),
    path = require('path');

slinker.link({
	modules: ['models', 'views'],
	modulesBasePath: __dirname,
	symlinkPrefix: '@',
	nodeModulesPath: path.join(__dirname, 'node_modules'),
	onComplete: function() {
		console.log('Yay, my modules are linked!');
	},
	onError: function(error) {
		console.log('Oh no, my modules aren\'t linked!');
	}
});
```

## Configuration

Slinker contains a number of configuration parameters that can be used to customize its use. Each parameter can be specified in the Object passed to the `#link()` function.

#### modules

An `Array` of submodule names that can be found within the `modulesBasePath`.

###### Relative Paths

A submodule name can also be a path to a subdirectory, relative to the `modulesBasePath` directory. The inner-most subdirectory name is used for the name of the symlink. For example:
 
```javascript
slinker.link({
	modules: ['path/to/models'],
	modulesBasePath: __dirname,
	symlinkPrefix: '@',
	nodeModulesPath: path.join(__dirname, 'node_modules'),
	// other configs below
});
 ```

This will result in a symlink named `@models`, linked to `__dirname/path/to/models`, under the `__dirname/node_modules` directory.

###### module Definition Object

A submodule name can also be aliased if you prefer that the symlink is a name other than the actual submodule name. To utilize the aliasing, an Object that contains the `module` and the `alias` properties. The `module` property is the name/path of the submodule while the `alias` property is the alias name of the the symlink to be used. For example:

```javascript
slinker.link({
	modules: [{ module: 'models', alias: 'awesome_models'}],
	modulesBasePath: __dirname,
	symlinkPrefix: '@',
	nodeModulesPath: path.join(__dirname, 'node_modules'),
	// other configs below
});
 ```

This will create a symlink in the `nodeModulesPath` directory named `@awesome_models` that points to the `__dirname/models` directory. The `module` property must still be a valid module name or relative path that is relative to the `modulesBasePath` directory.

#### modulesBasePath

The `String` path under which all submodules will be searched for. By default, the directory under which slinker is being invoked will be used. If you want the base path to be the current directory of Slinker's invocation, you can use `__dirname`.

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
