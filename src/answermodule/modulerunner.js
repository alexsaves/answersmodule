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
var runModule = function(modulename) {
    var md = _definedModules[modulename];
    if (!md)
        return false;
    if (!md.executed && !_runmodules[md.name]) {
        for (var dep in md.dependencies) {
            if (!runModule(md.dependencies[dep]))
            {
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