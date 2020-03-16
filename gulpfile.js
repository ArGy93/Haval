const fs                     = require('fs');
const gulp                   = require('gulp');
const concat                 = require('gulp-concat');
const autoprefixer           = require('gulp-autoprefixer');
const cleanCSS               = require('gulp-clean-css');
const rename	               = require('gulp-rename');
const notify                 = require('gulp-notify');
const plumber                = require('gulp-plumber');
const sourcemaps             = require('gulp-sourcemaps');
const del                    = require('del');
const smartgrid              = require('smart-grid');
const scss                   = require('gulp-sass');
const imagemin               = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const pngquant               = require('imagemin-pngquant');
const svgmin                 = require('gulp-svgmin');
const svgSprite              = require('gulp-svg-sprite');
const cheerio                = require('gulp-cheerio');
const replace                = require('gulp-replace');
const cache                  = require('gulp-cache');
const pug                    = require('gulp-pug');
const gulpIf                 = require('gulp-if');
const webpack                = require('webpack-stream');
const browserSync            = require('browser-sync').create();


// Configs

const isDev = false;

const gridSettings = {
  path: './src/scss/helpers',
  config: {
    filename: 'grid',
    outputStyle: 'scss',
    tab: '  ',
    container: {
      fields: '15px'
    },
    breakPoints: {
      xl: {
        width: '1439px'
      },
      lg: {
        width: '1279px'
      },
      md: {
        width: '991px'
      },
      sm: {
        width: '767px'
      },
      xs: {
        width: '575px'
      }
    }
  }
}

const webpackConfig = {
  output: {
    filename: 'bundle.min.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: '/node_modules/',
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'eval-source-map' : 'none'
}

const stylePath = {
  scss: {
    watch: './src/scss/**/*.scss',
    bundleName: 'bundle.css',
    input: './src/scss/style.scss',
    output: './dist/css/'
  }
}

const imgPath = {
  svg: {
    watch: './src/img/svg/*.svg',
    bundleName: 'sprite.svg',
    input: './src/img/svg/*.svg',
    output: './dist/img/'
  }
}

const htmlPath = {
  watch: './src/pug/**/*.pug',
  input: './src/pug/pages/*.pug',
  output: './dist/'
}

const jsPath = {
  watch: './src/js/**/*.js',
  input: './src/js/index.js',
  output: './dist/js/'
}

const dataPath = {
  watch: './src/data/**/*.json',
  sectionContent: './src/data/haval-content.json'
}

const staticPath = {
  fonts: {
    input: 'src/fonts/**/*',
    output: 'dist/fonts/'
  },
  images: {
    input: './src/img/**/*.{png,jpg,jpeg,gif}',
    output: './dist/img/'
  }
}



// Functions

const clean = () => {
  return del(['./dist/'])
}

const clearImgCache = done => {
  return cache.clearAll(done)
}

const smartGrid = done => {
  smartgrid(gridSettings.path, gridSettings.config);

  done();
}

const preProcessing = () => {
  return  gulp.src(stylePath.scss.input)
              .pipe(gulpIf(isDev, sourcemaps.init()))
              .pipe(plumber({
                errorHandler: notify.onError( (err) => {
                  return {
                    title: 'Styles Error',
                    message: err.message
                  }
                })
              }))
              .pipe(scss().on('error', scss.logError))
              .pipe(autoprefixer({
                cascade: false
              }))
              .pipe(concat(stylePath.scss.bundleName))
              .pipe(gulpIf(!isDev, cleanCSS({
                level: 2
              })))
              .pipe(rename({
                suffix: '.min'
              }))
              .pipe(gulpIf(isDev, sourcemaps.write()))
              .pipe(gulp.dest(stylePath.scss.output))
              .pipe(browserSync.stream())
}

const pugCompiling = () => {
  return  gulp.src(htmlPath.input)
              .pipe(plumber({
                errorHandler: notify.onError( (err) => {
                  return {
                    title: 'Pug Error',
                    message: err.message
                  }
                })
              }))
              .pipe(pug({
                locals: {
                  sectionContent: JSON.parse(fs.readFileSync(dataPath.sectionContent, 'utf8'))
                },
                pretty: true
              }))
              .pipe(gulp.dest(htmlPath.output))
              .pipe(browserSync.stream())
}

const svgOptimization = () => {
  return  gulp.src(imgPath.svg.input)
              .pipe(svgmin({
                js2svg: {
                    pretty: true
                }
              }))
              .pipe(cheerio({
                run: function($) {
                  $('[fill]').removeAttr('fill');
                  $('[stroke]').removeAttr('stroke');
                  $('[style]').removeAttr('style');
                },
                parserOptions: {
                  xmlMode: true
                }
              }))
              .pipe(replace('&gt;', '>'))
              .pipe(svgSprite({
                mode: {
                  symbol: {
                    sprite: imgPath.svg.bundleName
                  }
                }
              }))
              .pipe(gulp.dest(imgPath.svg.output))
}

const jsCompiling = () => {
  return  gulp.src(jsPath.input)
              .pipe(webpack(webpackConfig))
              .pipe(gulp.dest(jsPath.output))
              .pipe(browserSync.stream())
}

const server = () => {
  browserSync.init({
    server: {
      baseDir: './dist/'
    },
    tunnel: false
  });

  gulp.watch(stylePath.scss.watch, preProcessing);
  gulp.watch(imgPath.svg.watch, svgOptimization);
  gulp.watch(jsPath.watch, jsCompiling);
  gulp.watch(htmlPath.watch, pugCompiling);
  gulp.watch(dataPath.watch, pugCompiling);
}

const static = () => {
  const staticFonts = gulp.src(staticPath.fonts.input)
                        .pipe(gulp.dest(staticPath.fonts.output));

  const staticImages = gulp.src(staticPath.images.input)
                        .pipe(gulp.dest(staticPath.images.output))

  return staticFonts, staticImages
}



// Tasks

gulp.task('clean', clean);
gulp.task('clear', clearImgCache);
gulp.task('grid', smartGrid);
gulp.task('css', preProcessing);
gulp.task('pug', pugCompiling);
gulp.task('svg', svgOptimization);
gulp.task('js', jsCompiling);
gulp.task('server', server);
gulp.task('static', static);

gulp.task('build', gulp.series( 'clean',
                                'grid',
                                'css',
                                'clear',
                                'svg',
                                'pug',
                                'js',
                                'static'
                              ));

gulp.task('watch', gulp.series( 'build', 'server'));