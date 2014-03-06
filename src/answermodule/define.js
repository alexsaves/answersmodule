/**
 * Holds loaded modules
 * @type {{}}
 * @private
 */
_moduleRecord = {};

/**
 * Check dependencies
 * @param modulerec
 */
var checkDependencies = function(modulerec) {
    var hasAll = true;
    for (var dep in modulerec.dependencies) {
        if (!_moduleRecord[modulerec.dependencies[dep]]) {
            answersRequire(modulerec.dependencies[dep]);
            hasAll = false;
        }
        if (preload_dependencies[dep]) {
            // We know we'll need some others
            for (var odep in preload_dependencies[dep]) {
                if (!_moduleRecord[preload_dependencies[dep][odep]]) {
                    // Go get this one also
                    answersRequire(preload_dependencies[dep][odep]);
                }
            }
        }
    }
    return hasAll;
};

/**
 * Looks to see if a common-js define() method is defined. If not, provides it
 * @type {*}
 */
window["define"] = (typeof(window["define"]) != 'undefined' && window["define"].amd) ? window["define"] : function(modulename, dependencies, factory) {

    // Normalize arguments
    if (typeof(dependencies) == 'function') {
        factory = dependencies;
        dependencies = [];
    }

    /**
     * Make a record of the thing
     * @type {{dependencies: *, factory: *}}
     */
    _moduleRecord[modulename] = {
        name: modulename,
        dependencies: dependencies,
        factory: factory,
        executed: false
    };

    // Go see if we need to load any dependencies
    checkDependencies(_moduleRecord[modulename]);

    // Try to run any non executed modules
    for (var md in _moduleRecord) {
        var mdl = _moduleRecord[md];
        if (!mdl.executed) {
            runModule(md);
        }
    }

};

// Set the AMD signature
window["define"].amd = !!window["define"].amd ? window["define"].amd : {};
