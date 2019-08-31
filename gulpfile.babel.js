import gulp from 'gulp';
import path from 'path';
import del from 'del';
import notifier from 'node-notifier';
import nodemon from 'gulp-nodemon';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';

const paths = {
    js: ['./src/**/*.js', '!dist/**', '!node_modules/**', '!coverage/**'],
    nonJs: ['./package.json', './.gitignore', './.env'],
    tests: './server/tests/*.js',
};

// clean up dist and coverage directory
const clean = () => {
    return del([
        'dist/**',
        'dist/.*',
        'coverage/**',
        '!dist',
        '!coverage',
    ]);
};

// copy non-js files to dist
const copy = () => {
    return gulp
        .src(paths.nonJs, { base: '.' })
        .pipe(gulp.dest('dist'));
};

// compile and copy to dist
const compile = () => {
    return gulp
        .src([...paths.js, '!gulpfile.babel.js'], { base: '.' })
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write('.', {
            includeContent: false,
            sourceRoot(file) {
                return path.relative(file.path, __dirname);
            },
        }))
        .pipe(gulp.dest('./dist'));
};

// start server with restart on file changes
const watch = () => {
    return nodemon({
        script: 'dist/src/index.js',
        watch: 'src',
        ext: 'js',
        ignore: ['node_modules/', 'dist/'],
        tasks: ['copy', 'compile'],
    }).on('start', () => {
        notifier.notify({
            title: 'babel-project-skeleton',
            message: 'nodemon - STARTED',
            timeout: 2,
        });
    }).on('restart', () => {
        notifier.notify({
            title: 'babel-project-skeleton',
            message: 'nodemon  - RESTARTED',
            timeout: 2,
        });
    }).on('crash', () => {
        notifier.notify({
            title: 'babel-project-skeleton',
            message: 'nodemon  - CRASH',
            timeout: 2,
        });
    }).on('exit', () => {
        notifier.notify({
            title: 'babel-project-skeleton',
            message: 'nodemon  - EXIT',
            timeout: 2,
        });
    });
};

// export tasks
exports.clean = clean;
exports.copy = copy;
exports.watch = watch;
exports.compile = compile;
exports.serve = gulp.series(copy, compile, watch);
exports.default = gulp.series(clean, copy, compile);
