// TWD Group Project Gulpfile - version 6.0.0
// Created by: Michael Whyte

// This Gulpfile is modified from code found here:
// https://github.com/thecodercoder/frontend-boilerplate

// Initialize modules
// Import gulp specific API functions which allows us to write them 
// below as [gulp-function-name] instead gulp.[function-name],
// for example:
// src() instead of gulp.src()
const { src, dest, watch, series, parallel } = require('gulp');
// Import Gulp plugins and npm packages that we need for this project
const sourcemaps   = require('gulp-sourcemaps');
const sass         = require('gulp-sass');
const concat       = require('gulp-concat');
const uglify       = require('gulp-uglify-es').default;
const postcss      = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano      = require('cssnano');
const replace      = require('gulp-replace');
const browserSync  = require('browser-sync').create();
const del          = require('del');
const imageMin     = require('gulp-imagemin');
const cache        = require('gulp-cache');
const htmlMin      = require('gulp-htmlmin');
const gulpif       = require('gulp-if');

// Dev / Build State
// These variables are used to set the 
// dev or build state of the Gulpfile 
let devMode   = true;
let buildMode = false;

// Use jQuery
// This variable is used to determine if the
// jQuery library is being used or not.
// Set to false if you do not need the jQuery library in your project
const useJQuery = true;

// File Names
const filenames         = {};
filenames.jQuery        = 'jquery-3.4.1.min.js';
filenames.jsNoExtension = 'script.min';
filenames.js            = `${filenames.jsNoExtension}.js`;

// Folder Paths
const folders      = {};
// Main Folders
folders.dev        = 'dev';
folders.dist       = 'dist';
folders.styles     = 'styles';
folders.sass       = 'scss';
folders.images     = 'images';
folders.fonts      = 'fonts'
folders.scripts    = 'scripts';
folders.libs       = 'libs';
folders.jQuery     = 'jquery';
// JavaScript Folders
folders.jsDev      = `${folders.dev}/${folders.scripts}`;
folders.jsDist     = `${folders.dist}/${folders.scripts}`;
folders.libsDev    = `${folders.jsDev}/${folders.libs}`;
folders.libsDist   = `${folders.jsDistFolder}/${folders.libs}`; 
// jQuery Folders
folders.jQueryDev  = `${folders.libsDev}/${folders.jQuery}`;
folders.jQueryDist = `${folders.libsDist}/${folders.jQuery}`;
// Styles Folders
folders.stylesDev  = `${folders.dev}/${folders.styles}`;
folders.stylesDist = `${folders.dist}/${folders.styles}`;
// Images Folders
folders.imagesDev  = `${folders.dev}/${folders.images}`;
folders.imagesDist = `${folders.dist}/${folders.images}`;
// Fonts Folders
folders.fontsDev   = `${folders.dev}/${folders.fonts}`;
folders.fontsDist  = `${folders.dist}/${folders.fonts}`;

// File Paths
const files  = {};
// HTML Files 
files.html   = `${folders.dev}/**/*.html`;
// Sass Files 
files.sass   = `${folders.dev}/${folders.sass}/**/*.scss`;
// JavaScript Files
files.js     = `${folders.jsDev}/**/!(${filenames.jsNoExtension})*.js`;
files.libs   = `${folders.libsDev}/**/*.js`;
// jQuery Files
files.jQuery = `${folders.jQueryDev}/${filenames.jQuery}`;
// Images Files
files.images = `${folders.imagesDev}/**/*.+(png|jpg|gif|svg)`;
// Fonts Files
files.fonts  = `${folders.fontsDev}/**/*`;

// Development Tasks

// Sass Task: 
// 1. Compiles the Sass files into the dev styles folder
// 2. Adds CSS prefixes to the CSS files
// 3. Injects CSS into the browser (dev mode)
// 4. Compresses the CSS files (build mode)
// 5. Copies CSS files to the dist styles folder
function sassTask(){    
  return src(files.sass)
    .pipe(gulpif(devMode, sourcemaps.init())) // Initializes sourcemaps (dev mode) 
    .pipe(sass().on('error', sass.logError)) // compiles SCSS to CSS
    .pipe(gulpif(devMode, postcss([autoprefixer()]))) // Adds CSS prefixes (dev mode)
    .pipe(gulpif(devMode, sourcemaps.write('.'))) // writes sourcemaps file (dev mode)
    .pipe(gulpif(devMode, dest(folders.stylesDev))) // Puts CSS files in dev styles folder (dev mode)
    .pipe(gulpif(devMode, browserSync.stream())) // Injects new CSS to the browser (dev mode)
    .pipe(gulpif(buildMode, postcss([autoprefixer(), cssnano()]))) // Adds CSS prefixes and compresses CSS (build mode)
    .pipe(gulpif(buildMode, dest(folders.stylesDist))); // Copies CSS files to dist styles folder (build mode)
}

// JS Task: 
// 1. Concatenates JS files
// 2. If in build mode, compresses concatenated JS file
// 3. If in build mode, copies concatenated and minified JS file to the dist folder 
function jsTask(){
  return src([files.libs, files.js, `!${files.jQuery}`])
    .pipe(gulpif(devMode, sourcemaps.init())) // Initializes sourcemaps (dev mode)
    .pipe(concat(filenames.js)) // Concatenates JS files
    .pipe(gulpif(devMode, sourcemaps.write('.'))) // Writes sourcemaps (dev mode)
    .pipe(gulpif(devMode, dest(folders.jsDev))) // Puts concatenated JS file in dev scripts folder (dev mode)
    .pipe(gulpif(buildMode, uglify())) // Compresses JS file (build mode)
    .pipe(gulpif(buildMode, dest(folders.jsDistFolder))); // Copies concatenated and compressed JS file to the dist scripts folder (build mode)
}

// jQuery Task:
// 1. If useJQuery is set to true, copies jQuery to the dist scripts folder
function jQueryTask(done){
  if(useJQuery === true){
    src(files.jQuery)
      .pipe(dest(folders.jQueryDist)); // Copies jQuery to the dist scripts folder
  }
  done(); 
}

// HTML Task:
// 1. Compresses the HTML files
// 2. Copies the compressed HTML files to the dist folder 
function htmlTask(){
  return src(files.html)
    .pipe(htmlMin({collapseWhitespace: true})) // Compresses the HTML files
    .pipe(dest(folders.dist)); // Copies compressed HTML files to the dist folder
}

// Images Task:
// 1. Compresses the image files
// 2. Copies the compressed image files to the dist images folder
function imagesTask(){
  return src(files.images)
		.pipe(cache(imageMin({interlaced: true}))) // Compresses images
		.pipe(dest(folders.imagesDistFolder)); // Copies compressed images to the dist images folder
}

// Fonts Task:
// 1. Copies the font files to the dist fonts folder
function fontsTask(){
  return src(files.fonts)
    .pipe(dest(folders.fontsDist)); // Copies the font files to the dist fonts folder
}

// Cachebust Task:
// 1. Create a time stamp based on the current time
// 2. Replaces any query strings in the HTML files that uses the time stamp with the new timp stamp
function cacheBustTask(){
  const cbString = new Date().getTime(); // Create time stamp based on current time
  return src(files.html)
    .pipe(replace(/cb=\d+/g, 'cb=' + cbString)) // Replace current time stamp query string in the HTML files with the new time stamp
    .pipe(dest(folders.dev)); // Put the modified HTML files in the dev folder
}

// Watch Task: 
// 1. Watch for changes in the dev Sass directory, if a change is detected then it runs the Sass task
// 2. Watch for changes in the dev JS directory, if a change is detected then it runs the JS task
// 3. Watch for changes in the HTML files in the dev directory, if a change is deteched then it re-loads the browser 
function watchTask(){
  // Setup Browsersync for automatic reloading and re-freshing of CSS, Javascript and HTML
  browserSync.init({
    server: {
      baseDir: folders.dev
    }
  });
  watch(files.sass, sassTask); // Watches the dev Sass directory (SCSS files only)
  watch(files.js).on('change', series(jsTask, browserSync.reload)); // Watches the dev JavaScript directory (JS files only)
  watch(files.html).on('change', browserSync.reload); // Watches the dev folder (HTML files only)    
}

// Build Tasks

// Set Build State Task:
// 1. Sets devMode to false
// 2. Sets buildMode to true
function setBuildState(done){
  devMode = false;
  buildMode = true;
  done();
}

// Clean Task: 
// 1. Deletes all folders and files in the dist folder
function cleanTask(done){
  del.sync(folders.dist);
  done();
}

// Default Task:
// 1. Runs the following tasks in the following order:
//    a. sassTask, jsTask (in parallel)
//    b. cacheBustTask
//    c. watchTask
exports.default = series(parallel(sassTask, jsTask), cacheBustTask, watchTask);

// Build Task:
// 1. Runs the following tasks in the following order:
//    a. sassTask, jsTask (in parallel and in dev mode)
//    b. cacheBustTask
//    c. setBuildState (turns off dev mode and turns on build mode)
//    d. cleanTask
//    e. sassTask, jsTask, jQueryTask (in parallel and in build mode)
//    f. htmlTask, imagesTask, fontsTask (in parrellel)     
exports.build = series(parallel(sassTask, jsTask), cacheBustTask, setBuildState, cleanTask, parallel(sassTask, jsTask, jQueryTask), parallel(htmlTask, imagesTask, fontsTask));
