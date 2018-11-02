const gulp = require("gulp");
const hb = require("gulp-hb");
const watch = require("gulp-watch");
const rename = require("gulp-rename");
const browserSync = require("browser-sync");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss");
const webpackStream = require("webpack-stream");
const webpack = require("webpack");
const path = require("path");

const server = browserSync.create();

const paths = {
  scripts: {
    src: "src/js/app.js",
    dest: "dist/js/"
  },
  templates: {
    watchSrc: "src/templates/**/*.hbs",
    src: "src/templates/*.hbs",
    dest: "dist/"
  },
  styles: {
    src: "src/scss/**/*.scss",
    dest: "dist/styles/"
  },
  static: {
    src: "src/static/**/*.*",
    dest: "dist/"
  }
};

function generateHtml() {
  return gulp
    .src(paths.templates.watchSrc)
    .pipe(
      hb()
        .partials("./src/templates/partials/**/*.hbs")
        // .data("./src/template/data/**/*.{js,json}")
    )
    .pipe(rename({ extname: ".html" }))
    .pipe(gulp.dest(paths.templates.dest));
}

function generateStyles() {
  return gulp
    .src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(
      postcss([
        autoprefixer({
          browsers: [
            "Chrome >= 35",
            "Firefox >= 38",
            "Edge >= 12",
            "Explorer >= 10",
            "iOS >= 8",
            "Safari >= 8",
            "Android 2.3",
            "Android >= 4",
            "Opera >= 12"
          ]
        })
      ])
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dest));
}

function generateScripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(
      webpackStream(
        {
          mode: process.env.NODE_ENV,
          devtool: "source-map",
          module: {
            rules: [
              {
                test: /\.js$/,
                exclude: ["/node_modules/"],
                loader: "babel-loader"
              }
            ]
          },
          optimization: {
            splitChunks: {
              chunks: "all",
              minSize: 30000,
              minChunks: 1,
              maxAsyncRequests: 5,
              maxInitialRequests: 3,
              automaticNameDelimiter: "-",
              name: true,
              cacheGroups: {
                vendors: {
                  test: /[\\/]node_modules[\\/]/,
                  priority: -10,
                  reuseExistingChunk: true
                },
                default: {
                  minChunks: 2,
                  priority: -20,
                  reuseExistingChunk: true
                }
              }
            }
          },
          output: {
            filename: "[name].js"
          }
        },
        webpack
      )
    )
    .pipe(gulp.dest(path.join(__dirname, paths.scripts.dest)));
}

function copyStatic() {
  return gulp.src(paths.static.src).pipe(gulp.dest(paths.static.dest));
}

function serve(done) {
  server.init({
    files: ["dist/**/*.*"],
    server: {
      baseDir: "./dist"
    }
  });
  done();
}
gulp.task("browser-sync", serve);

gulp.task("templates", generateHtml);
gulp.task("styles", generateStyles);
gulp.task("scripts", generateScripts);
gulp.task("static", copyStatic);

gulp.task("watch:styles", done => {
  gulp.watch(paths.styles.src, gulp.series("styles"));
  done();
});

gulp.task("watch:scripts", done => {
  gulp.watch(paths.scripts.src, gulp.series("scripts"));
  done();
});

gulp.task("watch:html", done => {
  gulp.watch(paths.templates.watchSrc, gulp.series("templates"));
  done();
});

gulp.task("watch:static", done => {
  gulp.watch(paths.static.src, gulp.series("static"));
  done();
});

gulp.task(
  "watch",
  gulp.parallel("watch:styles", "watch:html", "watch:scripts", "watch:static")
);

gulp.task("build", gulp.parallel("styles", "scripts", "templates", "static"));
gulp.task(
  "default",
  gulp.series("build", gulp.parallel("watch", "browser-sync"))
);
