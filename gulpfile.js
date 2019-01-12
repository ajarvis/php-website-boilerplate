// Load plugins
var browsersync   = require('browser-sync');
var del           = require('del');
var gulp          = require('gulp');
var gulpConnect   = require('gulp-connect-php');
var prefix        = require('gulp-autoprefixer');
var notify        = require('gulp-notify');
var plumber       = require('gulp-plumber');
var sass          = require('gulp-sass');
var sourcemaps    = require('gulp-sourcemaps');
var tildeImporter = require('node-sass-tilde-importer');


// Define paths
var basePath = {
  app:  'src/',
  dist: 'dist/',
};


// Build error messages
const onError = function(err) {
  notify.onError({
    title:    "Gulp",
    subtitle: "Failure!",
    message:  "Error: <%= error.message %>",
    sound:    "Basso"
  })(err);
  this.emit('end');
};


// Clean dist
function cleanDist() {
  return del(basePath.dist);
}


// BrowserSync
function runBrowsersync(done) {
  gulpConnect.server({}, function (){
    browsersync.init({
      proxy: '127.0.0.1:8000/dist/'
    });
  });
  done();
}


// SCSS tasks
var sassOptions = {
  outputStyle: 'expanded',
  importer: tildeImporter
};
var prefixerOptions = {
  browsers: ['last 2 versions']
};
function styles() {
  return gulp
    .src(basePath.app + 'scss/*.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions))
    .pipe(prefix(prefixerOptions))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(basePath.dist + 'assets/css'))
    .pipe(browsersync.stream());
}


// HTML tasks
function html(done) {
  gulp.src(basePath.app + '**/*')
    .pipe(gulp.dest(basePath.dist))
    .pipe(browsersync.stream());
  done();
}


// JS tasks
function scripts() {
  return gulp.src(basePath.app + 'js/*.js')
    .pipe(gulp.dest(basePath.dist + 'assets/js'))
    .pipe(browsersync.stream());
}


// Image tasks
function images() {
  return gulp.src(basePath.app + 'images/**/*.*')
    .pipe(gulp.dest(basePath.dist + 'assets/images'))
    .pipe(browsersync.stream());
}


// Copy tasks
function copy() {
  return gulp.src(basePath.app + 'assets/**/*.*')
    .pipe(gulp.dest(basePath.dist + 'assets'))
    .pipe(browsersync.stream());
}


// Watch files
function watchFiles() {
  gulp.watch(basePath.app+"*.*", html);
  gulp.watch(basePath.app+"scss/**/*", styles);
  gulp.watch(basePath.app+"js/**/*", scripts);
  gulp.watch(basePath.app+"img/**/*", images);
}


// BUILD TASKS
// ------------
gulp.task('default', gulp.series(cleanDist, html, styles, scripts, images, copy, gulp.parallel(watchFiles, runBrowsersync), function (done) {
  done();
}));