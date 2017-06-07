/*eslint-env node */
var gulp = require("gulp");
var usemin = require("gulp-usemin");
var sourcemap = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");
var minifyHtml = require("gulp-minify-html");
var minifyCss = require("gulp-minify-css");
var rev = require("gulp-rev");

gulp.task("usemin", function() {
	return gulp.src("./index.html")
	.pipe(usemin({
		css: [ sourcemap.init(), rev(), sourcemap.write() ],
		html: [ minifyHtml({ empty: true }) ],
		js: [ sourcemap.init(), uglify(), rev(), sourcemap.write() ],
		inlinejs: [ uglify() ],
		inlinecss: [ minifyCss(), "concat" ]
	}))
	.pipe(gulp.dest("docs"));
});

gulp.task("default", ["usemin"]);

