'use strict';
import path from 'path';
import gulp from 'gulp';
import sass from 'gulp-sass';
import moduleImporter from 'sass-module-importer';
import sourcemaps from 'gulp-sourcemaps';
import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import gutil from 'gulp-util';
import BrowserSync from 'browser-sync';
import eslint from 'gulp-eslint';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import modernizr from 'gulp-modernizr';
import csscomb from 'gulp-csscomb';
import plumber from 'gulp-plumber';
import htmlmin from 'gulp-htmlmin';
import rollup from 'rollup-stream';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import rimraf from 'rimraf';
import runSequence from 'run-sequence';

gutil.env.production === true ?
  console.log('Building in production mode') :
  console.log('Building in dev mode');

// const gulp = help(Gulp);
const browserSync = BrowserSync.create();

// options
const config = {
  src: 'src',
  dest: 'build',
};

// error handling
const gulpSrc = gulp.src;
gulp.src = function () {
  return gulpSrc.apply(gulp, arguments)
    .pipe(plumber(function (error) {
        // Output an error message
        gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
        // emit the end event, to properly end the task
        this.emit('end');
      })
    );
};


/**
 * Clean dest
 */
gulp.task('clean:dest', [], (cb) => rimraf(config.dest, cb));

/**
 * Copy files to dest
 */
gulp.task('copy', [], () => gulp
  .src([])
  .pipe(gulp.dest(config.dest))
);

/**
 * Minify html
 */
gulp.task('htmlmin', function() {
  return gulp.src(path.join(config.src, '**/*.html'))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(config.dest));
});
/**
 * Minify all images
 */
gulp.task('imagemin', [], () => gulp
  .src(path.join(config.src, 'images/**/*.{png,jpg,svg,gif}'))
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{ removeViewBox: false }],
    use: [pngquant()]
  }))
  .pipe(gulp.dest(path.join(config.dest, 'images/')))
  .pipe(browserSync.stream({ match: '**/*.{png,jpg,svg,gif}' }))
);


/**
 * Compile SCSS
 */
gulp.task('sass', [], () => gulp
  .src(path.join(config.src, 'styles/**/*.scss'))
  .pipe(sourcemaps.init())
  .pipe(csscomb())
  .pipe(sass({
    // importer: moduleImporter(),
    outputStyle: gutil.env.production === true ? 'compressed' : 'expanded',
    includePaths: ['./node_modules'],
  }))
  .pipe(plumber())
  .pipe(postcss([autoprefixer({ browsers: ['last 3 versions'] })]))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(path.join(config.dest, 'styles/')))
  .pipe(browserSync.stream({ match: '**/*.css' }))
);

/**
 * ES lint
 */
gulp.task('eslint', () => gulp
  .src(path.join(config.src, 'scripts/**/*.js'))
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
);

/**
 * Build modernizr
 */
gulp.task('modernizr', () => gulp
  .src(path.join(config.src, 'scripts/**/*.js'))
  .pipe(modernizr({
    'options': [
      'setClasses',
      'addTest',
      'html5printshiv',
      'testProp',
      'fnBind'
    ],
    'tests': [],
    'excludeTests': []
  }))
  .pipe(gulp.dest(path.join(config.dest, '/scripts')))
);

/**
 * Compile JavaScript using rollup
 */
let rollupCache;
gulp.task('rollup', ['eslint'], function () {
  const nodeResolveOptions = {
    module: true,
    jsnext: true,
    main: true,
    browser: true,
    preferBuiltins: false
  };
  const commonjsOptions = { include: 'node_modules/**', sourceMap: true, };
  const scriptsDir = path.join(config.src, '/scripts');

  // we need to override .babelrc because gulp needs dirrefent configuration for Gulpfile.babel.js
  const babelOptions = {
    exclude: 'node_modules/**',
    babelrc: false,
    presets: ['es2015-rollup'],
  };
  if(gutil.env.production === true) {
    babelOptions.compact = true;
  }

  return rollup({
    entry: path.join(scriptsDir, 'app.js'),
    sourceMap: true,
    cache: rollupCache,
    plugins: gutil.env.production === true ? [
        builtins(),
        nodeResolve(nodeResolveOptions),
        commonjs(commonjsOptions),
        json(),
        babel(babelOptions),
        uglify()
      ] : [
        builtins(),
        nodeResolve(nodeResolveOptions),
        commonjs(commonjsOptions),
        json(),
        babel(babelOptions),
      ],
  })
    .on('bundle', function (bundle) {
      rollupCache = bundle;
    })
    .pipe(plumber())
    .pipe(source('app.js', scriptsDir))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.join(config.dest, '/scripts')));
});

/**
 * BrowserSync task
 */
gulp.task('browserSync', ['imagemin', 'sass', 'rollup', 'modernizr'], () => {
  browserSync.init({
    server: [config.dest, config.src],
    reloadOnRestart: true,
    notify: true,
    open: false
  });

  gulp
    .watch(path.join(config.src, 'styles/**/*.scss'), ['sass']);
  gulp
    .watch(path.join(config.src, 'scripts/**/*.js'), () => {
      runSequence('rollup', browserSync.reload);
    });
  gulp
    .watch(path.join(config.src, 'images/**/*.{png,jpg,svg,gif}'), ['imagemin'])
    .on('change', browserSync.reload);
  gulp
    .watch(path.join(config.src, '**/*.html'))
    .on('change', browserSync.reload);
});


/**
 * Serve project with browsersync
 */
gulp.task('serve', (cb) =>
  runSequence('clean:dest', ['browserSync'], cb)
);
// alias watch and server for serve
gulp.task('server', ['serve']);
gulp.task('watch', ['serve']);

/**
 * Compile project (default task)
 */
gulp.task('default', (cb) =>
  runSequence('clean:dest', ['copy', 'htmlmin', 'imagemin', 'sass', 'rollup', 'modernizr'], cb)
);
