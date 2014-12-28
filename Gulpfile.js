'use strict';

var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    livereload = require('tiny-lr'),
    jshint = require('gulp-jshint');

gulp.task('lint', function() {
  gulp.src('./**/*.js')
      .pipe(jshint());
});

var notifyLivereload = function(event) {
  var filename = require('path').relative(__dirname, event.path);
  livereload.changed(filename);
};

gulp.task('watch', function() {
  livereload().listen(3001);
  gulp.watch('./**/*.less', notifyLivereload);
  gulp.watch('./**/*.jade', notifyLivereload);
  gulp.watch('./public/**/*', notifyLivereload);
});

gulp.task('develop', function() {
  nodemon({
    script: 'server.js',
    ext: 'js'
  }).on('change', ['lint'])
    .on('restart', function() {
      console.log('Server restarted!');
    });
});

gulp.task('default', ['develop', 'watch']);
