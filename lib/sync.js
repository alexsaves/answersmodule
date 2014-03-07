/**
 * Syncer
 * Created by whitehawk on 2/5/2014.
 */

var os = require('os');
var path = require('path');
var gutil = require('gulp-util');
var through = require('through');

/**
 * Syncer Class
 * @constructor
 */
var Syncer = function () {
};

/**
 * Set up the interface
 * @type {{}}
 */
Syncer.prototype = {

    /**
     * Fire up a synchronous call
     * @param port
     * @param dir
     * @param doserver
     * @returns {*}
     */
    waitForCallback: function (callback) {

        return through(function (file) {

        }, function () {

            callback.call();

            this.emit('end');
        });
    }

};

/**
 * Export it
 */
module.exports = Syncer;