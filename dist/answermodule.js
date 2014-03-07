(function () {
    /**
     * Customer-specific configuration file
     */
    AnswersProductWhitelist = {

        webcollage: {
            /**
             * Checks to see if this page has this product or not
             * @param config
             * @returns {boolean}
             */
            check: function (config) {
                return ( !! config["hasWebCollageHereOrSomethign"]);
            }
        },

        youtube: {
            /**
             * Checks to see if this page has this product or not
             * @param config
             * @returns {boolean}
             */
            check: function (config) {
                return document.querySelectorAll('*[role=youtube]').length > 0;
            }
        },

        foreseecxreplay: {
            /**
             * In this case it just says it has it
             */
            check: false
        }
    };
    /**
     * Set up the Answers namespace
     */
    window["AnswersML"] = AnswersML = (function () {

        // Keep a reference to whatever data we need to share
        var data = {};

        /**
         * Receive some configuration
         * @private
         */
        var begin = function (config) {
            data.config = config;

            // Loop over the config and test all the rules
            for (var prod in AnswersProductWhitelist) {
                var prd = AnswersProductWhitelist[prod];
                if (prd.check === true || (typeof(prd.check) == 'function' && prd.check(config))) {
                    answersRequire(prod);
                }
            }

        };

        /**
         * Export the interface
         */
        return {
            "go": begin,
            "data": data
        }
    })();
    /**
     * Holds loaded modules
     * @type {{}}
     * @private
     */
    _definedModules = {};

    /**
     * Check dependencies
     * @param modulerec
     */
    var checkDependencies = function (modulerec) {
        var hasAll = true;
        for (var dep in modulerec.dependencies) {
            if (!_definedModules[modulerec.dependencies[dep]]) {
                answersRequire(modulerec.dependencies[dep]);
                hasAll = false;
            }
            if (preload_dependencies[dep]) {
                // We know we'll need some others
                for (var odep in preload_dependencies[dep]) {
                    if (!_definedModules[preload_dependencies[dep][odep]]) {
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
    window["define"] = (typeof(window["define"]) != 'undefined' && window["define"].amd) ? window["define"] : function (modulename, dependencies, factory) {

        // Normalize arguments
        if (typeof(dependencies) == 'function') {
            factory = dependencies;
            dependencies = [];
        }

        /**
         * Make a record of the thing
         * @type {{dependencies: *, factory: *}}
         */
        _definedModules[modulename] = {
            name: modulename,
            dependencies: dependencies,
            factory: factory,
            executed: false
        };

        // Force the reconciliations to happen asynchronously
        setTimeout(function () {
            // Go see if we need to load any dependencies
            checkDependencies(_definedModules[modulename]);

            // Try to run any non executed modules
            for (var md in _definedModules) {
                var mdl = _definedModules[md];
                if (!mdl.executed && _requiredModules[md]) {
                    runModule(md);
                }
            }
        }, 0);

    };

    // Set the AMD signature
    window["define"].amd = !! window["define"].amd ? window["define"].amd : {};

    /**
     * Quick reference of previously executed modules
     * @type {{}}
     * @private
     */
    var _runmodules = {};

    /**
     * Execute a module, checking its dependency tree along the way
     * @param modulename
     */
    var runModule = function (modulename) {
        var md = _definedModules[modulename];
        if (!md) return false;
        if (!md.executed && !_runmodules[md.name]) {
            for (var dep in md.dependencies) {
                if (!runModule(md.dependencies[dep])) {
                    return false;
                }
            }
            _runmodules[md.name] = true;
            md.executed = true;
            var argList = [];
            for (var depq in md.dependencies) {
                argList.push(_definedModules[md.dependencies[depq]].exports);
            }
            md.exports = md.factory.apply(window, argList);
        }
        return true;
    };
    /**
     * Helps us by preloading known dependencies. Saves time on first load, but not absolutely necessary
     * @type {{foreseecxreplay: string[]}}
     */
    var preload_dependencies = {
        /**
         * ForeSee cxReplay requires foreseetrigger, let's say
         */
        "foreseecxreplay": ["foreseetrigger"]
    };

    /**
     * Quick reference of previously retrieved modules
     * @type {{}}
     * @private
     */
    var _requiredModules = {};

    /**
     * Defines a special require method that takes advantage of the preloading sequence
     * @type {*}
     */
    var answersRequire = function (modulename) {
        if (!_requiredModules[modulename] && !_definedModules[modulename]) {
            var d = document,
                w = window,
                am = d.createElement('script'),
                aex = {
                    'src': 'modules/' + modulename + '.js',
                    'type': 'text/javascript',
                    'async': 'true'
                };

            for (var attr in aex) {
                am[attr] = aex[attr];
            }

            // Put it in the document
            d.head.appendChild(am);

            // Using the dependency helper, also go grab the known prerequisites
            var preqs = preload_dependencies[modulename];
            if (preqs) {
                for (var preq in preqs) {
                    answersRequire(preqs[preq]);
                }
            }
        }
        _requiredModules[modulename] = true;
    };
})()