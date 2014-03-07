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
var webserverlib = require('./lib/webserver.js');
var ws = new webserverlib();
var syncer = require('./lib/sync.js');
var requirejs = require('gulp-module-requirejs');
var fixturesfolder = "",
    distfolder = "modules";

/**
 * Builds a module
 */
var buildDiscreteModule = function(modulename) {

    console.log(("Building " + modulename + "...").yellow);
    gulp.src('./src/modules/' + modulename + '/**/*.*')
        .pipe(concat(modulename + '.js'))
        .pipe(beautify())
        .pipe(gulp.dest('./dist/' + distfolder));
};

// Assemble the module loader and fixtures
gulp.task('parallel', function (cb) {

    console.log("Building parallel modules..".yellow);

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

    var modules = ["foreseecxreplay", "foreseetrigger", "webcollage", "youtube"];
    for (var modl in modules) {
        buildDiscreteModule(modules[modl]);
    }

    // Copy assets and start the web server
    gulp.src('./assets/*.*')
        .pipe(gulp.dest('./dist/' + fixturesfolder))
        .pipe(ws.go(3131, './dist', true));

    cb();
});

// Assemble the module loader and fixtures
gulp.task('rollup', function () {

    console.log("Building rollup gateway js..".yellow);

    var sn = new syncer();

    // Clean the output
    gulp.src('./dist/' + distfolder, {read: false})
        .pipe(clean());
    gulp.src('./dist/*.*', {read: false})
        .pipe(clean());

    // Build the Answers Module Loader
    gulp.src('./src/answermodule/**/*.*')
        .pipe(concat('answermodule.js'))
        .pipe(header(fs.readFileSync('./config/config.js')))
        .pipe(beautify())
        .pipe(gulp.dest('./dist/' + fixturesfolder))
        .pipe(sn.waitForCallback(function() {

            var basefile = fs.readFileSync('./dist/answermodule.js', 'utf-8');

            gulp.src('./dist/answermodule.js', {read: false})
                .pipe(clean());

            // Build the Answers Module Loader
            gulp.src('./src/modules/**/*.*')
                .pipe(concat('answermodule.js'))
                .pipe(header(basefile))
                .pipe(header('(function() {'))
                .pipe(footer('})()'))
                .pipe(beautify())
                .pipe(gulp.dest('./dist/' + fixturesfolder))
                .pipe(ws.go(3131, './dist', true));
        }))

    // Copy over fixtures
    gulp.src('./assets/*.*')
        .pipe(gulp.dest('./dist/' + fixturesfolder));

});