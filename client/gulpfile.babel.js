import gulp from 'gulp'
import babel from 'gulp-babel'
import mocha from 'gulp-mocha'
import newer from 'gulp-newer'
import uglifyes from 'uglify-es'
import nodemon from 'gulp-nodemon'
import composer from 'gulp-uglify/composer'
import del from 'del'
import path from 'path'
import removeCode from 'gulp-remove-code'
import sourcemaps from 'gulp-sourcemaps'

const uglify = composer(uglifyes, console)

const paths = {
  js: ['src/**/*.js'],
  nonJs: ['./package.json'],
  test: {
    src: 'test/*.js',
    dist: 'test-dist/',
    run: 'test-dist/*.js'
  },
  data: []
}

const clean = () => del(['dist/**', 'dist/.*', '!dist'])
const cleanTest = () => del(['test-dist/**'])
const copy = () => gulp.src(paths.nonJs).pipe(newer('dist')).pipe(gulp.dest('dist'))
const babelTest = () => gulp.src(paths.test.src).pipe(babel()).pipe(gulp.dest(paths.test.dist))

export function runTest () {
  return gulp.src('test-dist/index-test.js')
    .pipe(mocha({
      reporter: 'spec'
    }))
    .on('error', err => console.log(err.stack))
}

export function scripts () {
  return gulp.src([...paths.js, '!gulpfile.babel.js'])
    .pipe(newer('dist'))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.', {
      sourceRoot: path.join(__dirname)
    }))
    .pipe(gulp.dest('dist'))
}

export function scriptsProd () {
  return gulp.src([...paths.js, '!gulpfile.babel.js'])
    .pipe(newer('dist'))
    .pipe(removeCode({
      production: true
    }))
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
}

export const monitor = () => nodemon({
  script: path.join('dist', 'app.js'),
  ext: 'js',
  ignore: ['node_modules/**/*.js', 'dist/**/*.js'],
  tasks: ['copy', 'scripts']
})

gulp.task('build', gulp.series(clean, copy, scripts))
gulp.task('test', gulp.series(clean, copy, scripts, cleanTest, babelTest, runTest))
gulp.task('serve', gulp.series(clean, copy, scripts, monitor))
gulp.task('product', gulp.series(clean, copy, scriptsProd))
gulp.task('babel', gulp.series(clean, copy, scripts))
