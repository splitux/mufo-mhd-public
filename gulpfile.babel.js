import gulp from 'gulp';
var $ = require('gulp-load-plugins')();
import config from './gulpfile.config.js';

import sass from 'gulp-sass';
import riot from 'gulp-riot';
import concat from 'gulp-concat';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import uglify from 'gulp-uglify';
import replace from 'gulp-replace-task';
import stripDebug from 'gulp-strip-debug';
import gulpif from 'gulp-if';

import watchify from 'watchify';
import browserify from 'browserify';
import babelify from 'babelify';
import source  from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import eslint from 'gulp-eslint';


// プロダクションとデバッグを切り替えてビルド
let isProductionBuild = false;
let pathDest = config.data.path.dev.dest;
gulp.task('switch-production', ()=>{
    console.log('Switch to Production build');
    isProductionBuild = true;
    pathDest = config.data.path.prd.dest;
})


// jsファイルのバンドル用browserify
const browserifyJs = browserify({
    entries: ['src/js/app.js']
    ,cache: {}
    ,packageCache: {}
    ,plugin: [watchify]
    ,debug: true
});
// jsファイルのバンドル関数
const bundleJs = ()=>{
    browserifyJs.transform(babelify, {presets: ['es2015']})
    .bundle()
    .on('error', function(err){   //ここからエラーだった時の記述
        notify.onError('Error on compiling es2015' + err.message);
        console.log(err.message);
        console.log(err.stack);
    })
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(gulpif(isProductionBuild, stripDebug()))
    .pipe(replace({patterns: isProductionBuild ? config.replacePrd : config.replaceDev}))
    //.pipe(uglify()) // console.logを消してしまうので開発中は圧縮しない
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(`${pathDest}/js/`))
};
browserifyJs.on('update', bundleJs);

// js（riotタグ以外）をコンパイル・結合します
// 出力 : dist/js/main.js
gulp.task('script', bundleJs);


// リソースファイルのコピー
// ディレクトリが増えた時は追加してください
// このタスクは自動監視では実行されません
// 必要な時に直接呼び出すか、gulp buildしてください
gulp.task('cpResource', function () {
    return gulp.src(
        ['src/img/**/*', 'src/fonts/**/*'],
        { base: 'src' }
    )
        .pipe(gulp.dest(pathDest));
});

// htmlのコピー
// 今のところ特に何もしていません
gulp.task('cpHtml', function () {
    return gulp.src(
        ['src/*.html'],
        { base: 'src' }
    )
    .pipe(replace({patterns: isProductionBuild ? config.replacePrd : config.replaceDev}))
    .pipe(gulp.dest(pathDest));
});

// lint
gulp.task('lint', function() {
    return gulp.src(['src/**/*.js','src/**/*.tag']) // lint のチェック先を指定
      .pipe(plumber({
        // エラーをハンドル
        errorHandler: function(error) {
            var taskName = 'eslint';
            var title = '[task]' + taskName + ' ' + error.plugin;
            var errorMsg = 'error: ' + error.message;
            // エラーを通知
            notify.onError(
                `${title} :  ${errorMsg}`
            )}
      }))
      .pipe(eslint({ useEslintrc: true }))
      .pipe(eslint.format())
      //.pipe(eslint.failOnError())
      //.pipe(plumber.stop())
      ;
  });


// sassをコンパイル・結合します
// 出力 : dist/css/style.css
gulp.task('sass', () => {
    gulp.src('./src/css/**/*.scss')
        .pipe(plumber({
            errorHandler: notify.onError("Error on compiling sass : <%= error.message %>")
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(concat("style.css"))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(`./${pathDest}/css`));
});


//riot
// riotタグをコンパイル・結合します
// 出力 : dist/js/tags.js
gulp.task('riot', () => {
    gulp.src(["src/tag/*.tag"])
        .pipe(plumber({
            errorHandler: notify.onError("Error on compiling riot tag : <%= error.message %>")
        }))
        .pipe(riot({
            type: 'es6',
            compact : true,
            parserOptions: {
                js: {
                    babelrc: false,
                    presets: ['es2015-riot'],
                    /*plugins: ['add-module-exports', 'transform-runtime'],*/
                }
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(concat("tags.js"))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(`./${pathDest}/js/`))
})


// SVG sprite作成
gulp.task("svg", () => {
    gulp.src("./src/img/icons/*.svg")
        .pipe($.svgmin())
        .pipe($.svgstore({
            inlineSvg: true
        }))
        .pipe($.cheerio({
            run: ($, file) => {
                // 不要なタグを削除
                $("style,title,defs").remove();
                // symbolタグ以外のid属性を削除
                $("[id]:not(symbol)").removeAttr("id");
                // Illustratorで付与される「st」または「cls」ではじまるclass属性を削除
                $("[class^='st'],[class^='cls']").removeAttr("class");
                // svgタグ以外のstyle属性を削除
                $("[style]:not(svg)").removeAttr("style");
                // data-name属性を削除
                $("[data-name]").removeAttr("data-name");
                // fill属性を削除
                $("[fill]").removeAttr("fill");
                // svgタグにdisplay:noneを付与（読み込み時、スプライト全体を非表示にするため）
                $("svg").attr({
                    style: "display:none"
                });
            },
            parserOptions: {
                xmlMode: true
            }
        }))
        .pipe(gulp.dest(`./${pathDest}/img`));
});


//自動監視のタスク
gulp.task('watch', () => {
    gulp.watch('src/css/**/*.scss', ['sass']);
    //gulp.watch('src/js/**/*.js', ['lint']); //時間短縮のため.jsのバンドルはwatchifyで実行
    gulp.watch('src/tag/**/*.tag', ['lint','riot']);
    gulp.watch('src/*.html', ['cpHtml']);

});


gulp.task("browserSync", () => {
    browserSync({
        server: {
            baseDir: `./${pathDest}`    // サーバとなる Root ディレクトリ
        }
    });
    // ファイルの監視 : 以下のファイルが変わったらリロード処理を呼び出す
    gulp.watch(`./${pathDest}/**/*`, ["reload"]);
});
gulp.task("reload", () => {
    browserSync.reload();
});

// ビルド
gulp.task("build", ["cpResource", "cpHtml", "script", "sass", "riot", "svg"]);
gulp.task("production", ["switch-production", "build"]);

// 開始 : 最初に一式ビルドしてから監視を開始する
gulp.task("default", ["build", "watch", "browserSync", "reload"]);

