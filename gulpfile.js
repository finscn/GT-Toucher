var encoding = 'utf-8';
var newLine = '\n';

var argv = process.argv.slice(2);
// if (argv.length == 0) {
//     console.error("argv is wrong.");
// }


(function() {
    console.log('\n');
    console.log(argv);
}());



var cp = require('child_process');
var fs = require('fs-extra');
var path = require('path');
var crypto = require('crypto');

var glob = require('glob');

var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var inject = require('gulp-inject-string');
var replace = require('gulp-string-replace');
var shell = require('gulp-shell');
var eslint = require('gulp-eslint');
var pump = require('pump');
var runSequence = require('run-sequence');


var pkg = require('./package.json');

var buildTime;

(function() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var H = date.getHours();
    var M = date.getMinutes();
    buildTime = [year, month, day].join('-');
    buildTime += ' ' + [H, M].join(':');
}());


////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////


var baseDir = '.'
var srcPath = './src';
var distPath = './dist';
var allInOneFileName = 'gt-toucher.js';
var minFileName = 'gt-toucher.min.js';

var jsFileList = [
    "Controller.js",
    "TouchWrapper.js",
    "Listener.js",

    "gesture/Any.js",
    "gesture/Tap.js",
    "gesture/Pan.js",
    "gesture/Swipe.js",
    "gesture/Pinch.js",
    "gesture/Rotate.js",

    "components/Touchpad.js",
    "components/TouchButton.js",
    "components/TouchStick.js",
];

jsFileList = jsFileList.map(function(value) {
    return srcPath + '/' + value;
});


gulp.task('pack', function(cb) {
    var files = ([]).concat(jsFileList);
    pump([
            gulp.src(files, {
                cwd: baseDir,
                base: baseDir
            }),
            concat(allInOneFileName),
            inject.append('\nif(typeof module !== "undefined"&&module){module.exports = Toucher;}\n'),
            eslint('.eslintrc.js'),
            eslint.format(),
            gulp.dest(distPath),
        ],
        function() {
            cb && cb();
        }
    );
});

gulp.task('minify', function(cb) {
    pump([
            gulp.src(allInOneFileName, {
                cwd: distPath,
                base: baseDir
            }),
            concat(minFileName),
            uglify(),
            gulp.dest(distPath),
        ],
        function() {
            cb && cb();
        }
    );
});


gulp.task('build', function(cb) {
    runSequence('pack', 'minify');
});


gulp.task('default', function(cb) {
    runSequence('build');
});


function randomInt(min, max) {
    return ((max - min + 1) * Math.random() + min) >> 0;
}
