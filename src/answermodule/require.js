
/**
 * Quick reference of previously retrieved modules
 * @type {{}}
 * @private
 */
var _retrievedModules = {};

/**
 * Defines a special require method that takes advantage of the preloading sequence
 * @type {*}
 */
var answersRequire = function(modulename) {
    if (!_retrievedModules[modulename]) {
        _retrievedModules[modulename] = true;
        var d = document,
            w = window,
            am = d.createElement('script'),
            aex = {
                'src': '/modules/' + modulename + '.js',
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
};