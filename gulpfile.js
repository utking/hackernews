/*eslint-env node */
var gulp = require("gulp");
var usemin = require("gulp-usemin");
var uglify = require("gulp-uglify");
var minifyHtml = require("gulp-minify-html");
var minifyCss = require("gulp-minify-css");
var rev = require("gulp-rev");

gulp.task("usemin", function() {
	return gulp.src("./src/index.html")
	.pipe(usemin({
		css: [ rev() ],
		html: [ minifyHtml({ empty: true }) ],
		js: [ uglify(), rev() ],
		inlinejs: [ uglify() ],
		inlinecss: [ minifyCss(), "concat" ]
	}))
	.pipe(gulp.dest("docs"));
});

gulp.task("default", ["usemin"]);

