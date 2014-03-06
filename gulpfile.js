var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var gulpreplace = require('gulp-replace');
var clean = require('gulp-clean');
var beautify = require('gulp-beautify');
var header = require('gulp-header');
var footer = require('gulp-footer');
var colors = require('colors');
var fs = require('fs');
var closureCompiler = require('gulp-closure-compiler');
var webserverlib = require('./lib/webserver.js');
var ws = new webserverlib();

var fixturesfolder = "",
    distfolder = "modules";

/**
 * Builds a module
 */
var buildModule = function(modulename) {

    console.log(("Building " + modulename + "...").yellow);
    gulp.src('./src/modules/' + modulename + '/**/*.*')
        .pipe(concat(modulename + '.js'))
        .pipe(header('(function() {'))
        .pipe(footer('})()'))
        .pipe(beautify())
        .pipe(gulp.dest('./dist/' + distfolder));
};

// Assemble the module loader and fixtures
gulp.task('default', function () {

    // Clean the output
    gulp.src('./dist/' + distfolder, {read: false})
        .pipe(clean());
    gulp.src('./dist/*.*', {read: false})
        .pipe(clean());

    // Build the Answers Module Loader
    gulp.src('./src/answermodule/**/*.*')
        .pipe(concat('answermodule.js'))
        .pipe(header(fs.readFileSync('./config/config.js')))
        .pipe(header('(function() {'))
        .pipe(footer('})()'))
        .pipe(beautify())
        .pipe(gulp.dest('./dist/' + fixturesfolder));

    // Copy over fixtures
    gulp.src('./assets/*.*')
        .pipe(gulp.dest('./dist/' + fixturesfolder))
        .pipe(ws.go(3131, './dist', true));

    var modules = ["foreseecxreplay", "foreseetrigger", "webcollage", "youtube"];
    for (var modl in modules) {
        buildModule(modules[modl]);
    }

});