module.exports = function (grunt) {

    // static variables for livereload port numbers
    var LIVERELOAD_PORT = 35729;
    var SERVER_PORT = 8000;

    /*
     helper function to initiate a connect middlewear
     this will inject the livereload.js file dynamically into our .html files
     */
    var liveReloadSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
    var livereloadMiddleware = function (connect, options) {
        return [
            liveReloadSnippet,
            connect.static(options.base[0]),
            connect.directory(options.base[0])
        ];
    };

    //begin intial Grunt configuration
    grunt.initConfig({
        // apply some JavaScript hinting/linting (http://jshint.com/docs/)
        // note this uses .jshintrc for it's configuration based on https://github.com/johnpapa/angular-styleguide#js-hint
        jshint: {
            lintAllFiles: {
                src: ['app/modules/**/*.js', '!app/modules/**/*.test.js']
            }
        },
        /*
         adding annotations to our files
         annotations can be done manually as well and in most of the Angular files
         we have add them via the
         NameOfController.$inject = ['service1', 'service2'] pattern.

         However open app.js and see that it does not contain a list of injectable
         dependencies via the $inject property. ng-annotate will add it
         automatically
         */
        ngAnnotate: {
            options: {
                singleQuotes: true,
                add: true
            },
            target: {
                files: [
                    {
                        expand: true,
                        src: ['app/modules/**/*.js', '!app/modules/**/*.test.js', '!app/modules/**/*.annotated.js'],
                        ext: '.annotated.js'
                    }
                ]
            }
        },
        /*
         with uglify we are minifying our !!annotated!! javascript files and also
         concatinate them together, so we will end up having one app.min.js file

         we are also building a sourcemap app.min.js.map that will allow us to
         debug our angular application easier from the browser's console by
         showing us the original, non-minified javascript files
         */
        uglify: {
            uglifyAllAnnotatedFiles: {
                options: {
                    sourceMap: true,
                    sourceMapIncludeSources: true,
                    sourceMapName: 'dist/assets/js/source.min.js.map'
                },
                files: {
                    'dist/assets/js/script.min.js': ['app/modules/**/*.annotated.js'],
					'dist/assets/js/vendor.min.js': [	'app/bower_components/jquery/dist/jquery.min.js',
															'app/bower_components/bootstrap/dist/js/bootstrap.min.js',
															'app/bower_components/angular/angular.min.js',
															'app/bower_components/angular/angular-animate.min.js',
															'app/bower_components/angular/angular-route.min.js'
															],
                }
            }
        },
		// minifying css using cssmin
		concat: {
			style: {
				src: ['app/*.css','app/assets/css/*.css','app/modules/**/*.css'],
				dest: '.tmp/css/style.css'
			},
			vendor: {
				src: [	'app/bower_components/angular/*.css',
						'app/bower_components/bootstrap/dist/css/bootstrap.min.css',
						'app/bower_components/bootstrap/dist/css/bootstrap-theme.min.css'],
				dest: '.tmp/css/vendor.css'
			}
		},
		
		cssmin: {
			  style: {
				  src: '.tmp/css/style.css',
				  dest: 'dist/assets/css/style.min.css'
			  },
			  vendor: {
				  src: '.tmp/css/vendor.css',
				  dest: 'dist/assets/css/vendor.min.css'
			  }
		},
		
		// html minifying
	
		htmlmin: {
		  dist: {
			options: {
			  collapseWhitespace: true,
			  conservativeCollapse: true,
			  collapseBooleanAttributes: true,
			  removeCommentsFromCDATA: true,
			  removeOptionalTags: true
			},
			files: [{
			  expand: true,
			  cwd: 'app/',
			  src: ['*.html', 'modules/**/*.html'],
			  dest: 'dist/'
			}]
		  }
		},
		
	    imagemin: {
		  dist: {
			files: [{
			  expand: true,
			  cwd: 'app/',
			  src: 'assets/img/**/*.{png,jpg,jpeg,gif}',
			  dest: 'dist/'
			}]
		  }
		},

		svgmin: {
		  dist: {
			files: [{
			  expand: true,
			  cwd: 'app/',
			  src: 'assets/img/**/*.svg',
			  dest: 'dist/'
			}]
		  }
		},
	
		
		copy: {
		  dist: {
			files: [{
			  expand: true,
			  dot: true,
			  cwd: 'app/',
			  dest: 'dist/',
			  src: [
				'**/*.{ico,png,txt}',
				'**/.htaccess',
				'assets/img/**/*.{webp}',
				'!bower_components/**/*'
			  ]
			},{
			expand: true,
			  dot: true,
			  cwd: 'app/bower_components/bootstrap/dist/',
			  dest: 'dist/assets/',
			  src: [
				'fonts/*.*'
			  ]
			}
			]
		  }
		},
	  
        // this task will create an HTTP server
        connect: {
            server: {
                options: {
                    port: SERVER_PORT,
                    livereload: true,
                    base: '.',
                    middleware: livereloadMiddleware
                }
            }
        },
        // this task is watching for changes in any of our javascript/html files
        // and on a script change it'll re-annotate and re-uglify the scripts
        watch: {
            scripts: {
                files: ['app/modules/**/*.js', '!app/modules/**/*.test.js'],
                tasks: ['ngAnnotate', 'uglify']
            },
            html: {
                files: ['index.html', 'app/**/*.html']
            },
            options: {
                reload: true,
                livereload: LIVERELOAD_PORT
            }
        },
        // this taks will open the browser and launch our application
        open: {
            testServer: {
                path: 'http://localhost:' + SERVER_PORT + '/index.html'
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-svgmin');
    grunt.loadNpmTasks('grunt-open');


    // finally we register the tasks that we have created
    // note that the order matters! The watch task should always be the last
    grunt.registerTask('default', ['jshint', 'ngAnnotate', 'uglify', 'concat', 'cssmin', 'htmlmin', 'imagemin', 'svgmin', 'copy:dist']);

};