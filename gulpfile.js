// Load plugins
var browsersync = require('browser-sync');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var del = require('del');
var gulp = require('gulp');
var gulpConnect = require('gulp-connect-php');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var prefix = require('gulp-autoprefixer');
var purgecss = require('gulp-purgecss');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var tildeImporter = require('node-sass-tilde-importer');
var uglify = require('gulp-uglify');


// Define paths
var basePath = {
  app: 'src/',
  dist: 'dist/',
};


// Build error messages
const onError = function (err) {
  notify.onError({
    title: "Gulp",
    subtitle: "Failure!",
    message: "Error: <%= error.message %>",
    sound: "Basso"
  })(err);
  this.emit('end');
};


// Clean dist
function cleanDist() {
  return del(basePath.dist);
}


// BrowserSync
function runBrowsersync(done) {
  gulpConnect.server({}, function () {
    browsersync.init({
      proxy: 'localhost:8000/dist/'
    });
  });
  done();
}
function disconnectServer(done) {
  gulpConnect.closeServer();
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
    .pipe(plumber({ errorHandler: onError }))
    .pipe(purgecss({
      content: [basePath.app + "views/**/*.php", basePath.app + "partials/**/*.php"],
      
    }))
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions))
    .pipe(prefix(prefixerOptions))
    .pipe(cleanCSS({ compatibility: '*' }))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(basePath.dist + 'assets/css'))
    .pipe(browsersync.stream());
}


// HTML tasks
function html(done) {
  gulp.src(basePath.app + 'views/**/*.*')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(basePath.dist))
    .pipe(browsersync.stream());
  gulp.src(basePath.app + 'partials/*')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(basePath.dist + 'assets/partials'))
    .pipe(browsersync.stream());
  done();
}


// JS tasks
function scripts(done) {
  gulp.src(basePath.app + 'js/**/*.js')
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest(basePath.dist + 'assets/js'))
    .pipe(rename('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(basePath.dist + 'assets/js'))
    .pipe(browsersync.stream());
  done();
}


// Image tasks
function images() {
  return gulp.src(basePath.app + 'images/**/*.*')
    .pipe(imagemin({
      interlaced: true,
      progressive: true,
      optimizationLevel: 5
    }))
    .pipe(gulp.dest(basePath.dist + 'assets/images'))
    .pipe(browsersync.stream());
}


// Watch files
function watchFiles() {
  gulp.watch(basePath.app + "views/**/*.*", html);
  gulp.watch(basePath.app + "partials/*.*", html);
  gulp.watch(basePath.app + "scss/**/*", styles);
  gulp.watch(basePath.app + "js/**/*", scripts);
  gulp.watch(basePath.app + "images/**/*", images);
}


// BUILD TASKS
// ------------
gulp.task('default', gulp.series(disconnectServer, cleanDist, html, styles, scripts, images, gulp.parallel(watchFiles, runBrowsersync), function (done) {
  done();
}));