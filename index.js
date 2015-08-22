/**
 * The entrypoint of slinker.
 */
'use strict';

var _ = require('underscore'),
    path = require('path'),
    fs = require('fs'),
    symlinksCreated = [],
    slinkerDefaults;

slinkerDefaults = {
    modules: [],
    symlinkPrefix: '@',
    nodeModulesPath: './node_modules'
};

/**
 * @param {Object} slinkerOptions
 *            The options Object that was passed to the Slinker invocation
 * @param {Object} slinkerOptions
 *            The options Object used to configure the symlink behavior
 * @param {String} symlinkConfig.module
 *            The name of the module to create a symlink for
 * @param {String} symlinkConfig.modulePath
 *            The path to the physical module that's used for symlink creation (includes the module name)
 * @param {String} symlinkConfig.symlinkNodeModulesPath
 *            The path to the location where the symlink will reside (includes the module name)
 * @param {Boolean} exists
 *            A Boolean value that indicates if the symlink already exists
 */
function createSymlinkIfNotExists(slinkerOptions, symlinkConfig, exists) {
    if (!exists) {
        fs.symlink(symlinkConfig.modulePath, symlinkConfig.symlinkNodeModulesPath, 'file', function(err) {
            if (err) {
                console.log("Error creating symlink for module '" + symlinkConfig.moduleAlias + "'! " + err);
                invokeOnError(slinkerOptions, err);
            } else {
                console.log("Symlink for module '" + symlinkConfig.moduleAlias + "' created.");
                onSymlinkCreated(slinkerOptions, symlinkConfig.module);
            }
        });
    } else {
        console.log("Symlink for module '" + symlinkConfig.moduleAlias + "' already exists. No op.");
        onSymlinkCreated(slinkerOptions, symlinkConfig.moduleAlias);
    }
}

/**
 * Invoked each time a symlink is created.
 *
 * @param {Object} slinkerOptions
 *            The options passed to slinker
 * @param {String} moduleAlias
 *            The name of the module that was created
 */
function onSymlinkCreated(slinkerOptions, moduleAlias) {
    symlinksCreated.push(moduleAlias);
    invokeOnComplete(slinkerOptions);
}

/**
 * Invoked when slinker has finished creating all symlinks. If an onComplete callback has
 * been specified, it is invoked.
 *
 * @param {Object} slinkerOptions
 *            The options passed to slinker
 */
function invokeOnComplete(slinkerOptions) {
    if (typeof slinkerOptions.onComplete === 'function' && slinkerOptions.modules.length === symlinksCreated.length) {
        slinkerOptions.onComplete();
    }
}

/**
 * Invoked when slinker encounters an error during symlink creation. If an onError callback has
 * been specified, it is invoked.
 *
 * @param {Object} slinkerOptions
 *            The options passed to slinker
 * @param {String} error
 *            The error that occurred
 */
function invokeOnError(slinkerOptions, error) {
    if (typeof slinkerOptions.onError === 'function') {
        slinkerOptions.onError(error);
    }
}

/**
 * Checks the preconditions when slinker is invoked. Returns true if all preconditions have been
 * met and slinker should be invoked.
 *
 * options {Object} options
 *            The options passed to slinker
 */
function checkPreconditions(options) {
    if (!options) {
        throw Error("'options' must be specified!");
    }

    if (!(options.modules instanceof Array)) {
        throw Error("'options.modules' must be an array!");
    }

    // If the modules array is empty, immediately call the onComplete() if it exists
    if (!options.modules.length) {
        if (options.onComplete) {
            invokeOnComplete(options);
        }

        return false;
    }

    return true;
}

/**
 * @param module
 *          The module parameter to determine the type of
 * @returns True if the parameter module is an Object, other false.
 */
function isModuleObject(module) {
    return (module && typeof(module) === 'object' && !Array.isArray(module));
}

/**
 * @param module
 *          The module string or object
 * @returns The module's path for the parameter module. If the parameter module is a JS object, then the `module`
 *     property for the module is returned.
 */
function getModulePathProperty(module) {
    var path = module;

    if (isModuleObject(module)) {
        path = module.module;

        if (!path) {
            throw 'A module Object must contain the \'module\' definition!';
        }
    }

    return path;
}

/**
 * @param module
 *          The module definition to retrieve the alias from
 * @returns The alias for the module if it's a JS object. Otherwise, return null.
 */
function getModuleAliasProperty(module) {
    var name = null;

    if (isModuleObject(module) && module.alias) {
        name = module.alias;
    }

    return name;
}

/**
 * Determines from the module path, what the name of the symlink should be. The deepest name in the path is used. For
 * example, if the module is `my/module/path/is/cool`, then the symlink name would be `cool`. If the module is an
 * object and the object contains the `alias` property, then the `alias` property is used for the symlink name.
 *
 * @param module
 *            The module path or object used to determine the name of the symlink
 * @return The name of the symlink, derived from the deepest path of the module or the module `alias`
 */
function getSymlinkNameFromModule(module) {
    var name = null,
        splitModule;

    name = getModuleAliasProperty(module);
    // If the module is not an Object or the alias wasn't specified, split the module path (if necessary)
    if (name == null) {
        module = getModulePathProperty(module);
        splitModule = module.split(path.sep);

        if (splitModule.length === 1) {
            return module;
        }

        return splitModule[splitModule.length - 1];
    }

    return name;
}

module.exports = {

    /**
     * Resets the array of modules that was created.
     */
    reset: function() {
        symlinksCreated = [];
    },

    /**
     *
     * @param {Object} options
     *            An Object that contains the symlinkConfigurations used for symlinking
     * @param {Array} options.modules
     *            An array that contains the name of each module (directory) to symlink
     * @param {String} options.modulesBasePath
     *            The base path under which all modules that are to be symlinked reside
     * @param {String} options.symlinkPrefix
     *            The prefix to use when creating a symlink
     * @param {String} options.nodeModulesPath
     *            The path to the node_modules directory where all symlinks will be created
     * @param {Function} options.onComplete
     *            A callback that is invoked once all symlinks have been created
     * @param {Function} options.onError
     *            A callback that is invoked if an error occurred while attempting to create a symlink
     */
    link: function(options) {
        options = _.defaults(options, slinkerDefaults);

        if (checkPreconditions(options)) {
            _.each(options.modules, function(module) {
                var modulePath,
                    moduleAlias,
                    symlinkNodeModulesPath;

                modulePath = getModulePathProperty(module);
                // The actual path to the file
                modulePath = path.join(options.modulesBasePath, modulePath);

                // Get the alias namve for the module
                moduleAlias = getSymlinkNameFromModule(module);
                // The path to the symlink under the node_modules directory
                symlinkNodeModulesPath =
                    path.join(options.nodeModulesPath, options.symlinkPrefix + moduleAlias);

                fs.exists(symlinkNodeModulesPath, _.bind(createSymlinkIfNotExists, this, options, {
                    moduleAlias: moduleAlias,
                    modulePath: modulePath,
                    symlinkNodeModulesPath: symlinkNodeModulesPath
                }));
            });
        }
    }

};