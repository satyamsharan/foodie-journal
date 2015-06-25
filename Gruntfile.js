'use strict';
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
                src: ['app/**/*.js', '!app/**/*.test.js']
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
            starwars: {
                files: [
                    {
                        expand: true,
                        src: ['app/**/*.js', '!app/**/*.test.js', '!app/**/*.annotated.js'],
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
                    sourceMapName: 'dist/js/app.min.js.map'
                },
                files: {
                    'dist/js/app.min.js': ['app/**/*.annotated.js']
                }
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
                files: ['app/**/*.js', '!app/**/*.test.js'],
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
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-open');


    // finally we register the tasks that we have created
    // note that the order matters! The watch task should always be the last
    grunt.registerTask('default', ['jshint', 'ngAnnotate', 'uglify', 'connect', 'open', 'watch']);

};