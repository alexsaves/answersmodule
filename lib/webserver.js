/**
 * Simple Web Server
 * Created by whitehawk on 2/5/2014.
 */

var os = require('os');
var path = require('path');
var gutil = require('gulp-util');
var connect = require('connect');
var http = require('http');
var through = require('through');

/**
 * Web Server Class
 * @constructor
 */
var WebServer = function () {

};

/**
 * Set up the interface
 * @type {{}}
 */
WebServer.prototype = {

    /**
     * Fire up a web server
     * @param port
     * @param dir
     * @param doserver
     * @returns {*}
     */
    go: function (port, dir, doserver) {

        return through(function (file) {

        }, function () {

            if (doserver) {
                console.log("Starting web server at " + port + " for folder " + dir + "...");
                console.log("Press CTRL-C to stop.".yellow);
                connect.createServer(
                    connect.static(dir)
                ).listen(port);
            }

            this.emit('end');
        });
    }

};

/**
 * Export it
 */
module.exports = WebServer;