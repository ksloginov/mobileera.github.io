'use strict';


var packageJson = require('./package.json');
var path = require('path');
var swPrecache = require('./node_modules/sw-precache/lib/sw-precache.js');


module.exports = function(grunt) {

    function writeServiceWorkerFile(rootDir, handleFetch, callback) {
        var config = {
            cacheId: packageJson.name,
            dynamicUrlToDependencies: {},
            // If handleFetch is false (i.e. because this is called from swPrecache:dev), then
            // the service worker will precache resources but won't actually serve them.
            // This allows you to test precaching behavior without worry about the cache preventing your
            // local changes from being picked up during the development cycle.
            handleFetch: handleFetch,
            logger: grunt.log.writeln,
            staticFileGlobs: [
                rootDir + '/css/**.css',
                rootDir + '/**.html',
                rootDir + '/img/**.*',
                rootDir + '/js/**.js'
            ],
            stripPrefix: rootDir + '/',
            // verbose defaults to false, but for the purposes of this demo, log more.
            verbose: true
        };

        swPrecache.write(path.join(rootDir, 'service-worker.js'), config, callback);
    }

    grunt.registerMultiTask('swPrecache', function() {
        var done = this.async();
        var rootDir = this.data.rootDir;
        var handleFetch = this.data.handleFetch;

        writeServiceWorkerFile(rootDir, handleFetch, function(error) {
            if (error) {
                grunt.fail.warn(error);
            }
            done();
        });
    });

    require('time-grunt')(grunt);
    require('jit-grunt')(grunt, {
        buildcontrol: 'grunt-build-control',
        swPrecache: 'swPrecache'
    });

    grunt.initConfig({
        swPrecache: {
            dev: {
                handleFetch: false,
                rootDir: 'dist'
            }
        },
        app: {
            source: 'app',
            dist: 'dist',
            baseurl: '',
            git_repo: 'git@github.com:mobileera/mobileera.github.io.git',
            branch: 'master'
        },
        watch: {
            sass: {
                files: ['<%= app.source %>/_assets/scss/**/*.{scss,sass}'],
                tasks: ['sass:server', 'autoprefixer']
            },
            scripts: {
                files: ['<%= app.source %>/_assets/js/**/*'],
                tasks: ['uglify:server']
            },
            jekyll: {
                files: ['<%= app.source %>/**/*.{html,yml,md,mkd,markdown,json,xml}'],
                tasks: ['jekyll:server']
            },
            images: {
                files: ['<%= app.source %>/img/**/*.{gif,jpg,jpeg,png,svg,webp}'],
                tasks: ['copy:server']
            }
        },
        browserSync: {
            options: {
                notify: false,
                port: 9000,
                open: true,
                startPath: '/<%= app.baseurl %>'
            },
            server: {
                options: {
                    watchTask: true,
                    injectChanges: true,
                    server: {
                        baseDir: ['.jekyll', '.tmp']
                    }
                },
                src: [
                    '.jekyll/**/*.{css,html,js,json,xml}',
                    '.tmp/**/*.{css,html,js,json,xml}',
                    '<%= app.source %>/**/*.{css,html,js,json,xml}'
                ]
            },
            dist: {
                options: {
                    server: {
                        baseDir: '<%= app.dist %>'
                    }
                },
                src: [
                    '<%= app.dist %>/**/*.{css,html,js,json,xml}',
                    '.tmp/**/*.{css,html,js,json,xml}'
                ]
            }
        },
        clean: {
            server: [
                '.jekyll',
                '.tmp'
            ],
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= app.dist %>/*',
                        '!<%= app.dist %>/.git*'
                    ]
                }]
            }
        },
        jekyll: {
            options: {
                config: '_config.yml,_config.build.yml',
                src: '<%= app.source %>',
                bundleExec: true
            },
            server: {
                options: {
                    config: '_config.yml',
                    dest: '.jekyll/<%= app.baseurl %>'
                }
            },
            dist: {
                options: {
                    dest: '<%= app.dist %>/<%= app.baseurl %>',
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    removeEmptyAttributes: true,
                    minifyJS: true,
                    minifyCSS: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>',
                    src: '**/*.html',
                    dest: '<%= app.dist %>/<%= app.baseurl %>'
                }]
            }
        },
        uglify: {
            server: {
                options: {
                    mangle: false,
                    beautify: true
                },
                files: {
                    '.tmp/<%= app.baseurl %>/js/libraries.js': [
                        'bower_components/sticky-kit/jquery.sticky-kit.js',
                        'bower_components/svg4everybody/svg4everybody.js',
                        'bower_components/typed.js/js/typed.js',
                        'bower_components/waves/dist/waves.js',
                        '<%= app.source %>/_assets/js/vendor/jquery.appear.js',
                        '<%= app.source %>/_assets/js/vendor/jquery.countTo.min.js'
                    ],

                    '.tmp/<%= app.baseurl %>/js/scripts.js': [
                        '<%= app.source %>/_assets/js/scripts.js'
                    ],

                    '.tmp/<%= app.baseurl %>/js/jquery.min.js': [
                        'bower_components/jquery/dist/jquery.js'
                    ],

                    '.tmp/<%= app.baseurl %>/js/bootstrap.min.js': [
                        'bower_components/bootstrap-sass/assets/javascripts/bootstrap.js'
                    ]
                }
            },
            dist: {
                options: {
                    compress: true,
                    preserveComments: false,
                    report: 'min'
                },
                files: {
                    '<%= app.dist %>/<%= app.baseurl %>/js/libraries.js': [
                        'bower_components/sticky-kit/jquery.sticky-kit.js',
                        'bower_components/svg4everybody/svg4everybody.js',
                        'bower_components/typed.js/js/typed.js',
                        'bower_components/waves/dist/waves.js',
                        '<%= app.source %>/_assets/js/vendor/jquery.appear.js',
                        '<%= app.source %>/_assets/js/vendor/jquery.countTo.min.js'
                    ],

                    '<%= app.dist %>/<%= app.baseurl %>/js/scripts.js': [
                        '<%= app.source %>/_assets/js/scripts.js'
                    ],

                    '.tmp/<%= app.baseurl %>/js/jquery.min.js': [
                        'bower_components/jquery/dist/jquery.min.js'
                    ],

                    '.tmp/<%= app.baseurl %>/js/bootstrap.min.js': [
                        'bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js'
                    ]
                }
            }
        },
        sass: {
            options: {
                includePaths: [
                    'bower_components/animate-sass',
                    'bower_components/bootstrap-sass/assets/stylesheets',
                    'bower_components/waves/src/scss'
                ]
            },
            server: {
                options: {
                    sourceMap: true,
                    outputStyle: 'expanded',
                    sourceComments: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= app.source %>/_assets/scss',
                    src: '**/*.{scss,sass}',
                    dest: '.tmp/<%= app.baseurl %>/css',
                    ext: '.css'
                }]
            },
            dist: {
                options: {
                    outputStyle: 'compressed'
                },
                files: [{
                    expand: true,
                    cwd: '<%= app.source %>/_assets/scss',
                    src: '**/*.{scss,sass}',
                    dest: '<%= app.dist %>/<%= app.baseurl %>/css',
                    ext: '.css'
                }]
            }
        },
        autoprefixer: {
            options: {
                browsers: ['last 3 versions']
            },
            server: {
                files: [{
                    expand: true,
                    cwd: '.tmp/<%= app.baseurl %>/css',
                    src: '**/*.css',
                    dest: '.tmp/<%= app.baseurl %>/css'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>/css',
                    src: '**/*.css',
                    dest: '<%= app.dist %>/<%= app.baseurl %>/css'
                }]
            }
        },
        critical: {
            dist: {
                options: {
                    base: './',
                    css: [
                        '<%= app.dist %>/<%= app.baseurl %>/css/main.css'
                    ],
                    minify: true,
                    width: 320,
                    height: 480
                },
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>',
                    src: ['**/*.html'],
                    dest: '<%= app.dist %>/<%= app.baseurl %>'
                }]
            }
        },
        cssmin: {
            dist: {
                options: {
                    keepSpecialComments: 0,
                    check: 'gzip'
                },
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>/css',
                    src: ['*.css'],
                    dest: '<%= app.dist %>/<%= app.baseurl %>/css'
                }]
            }
        },
        imagemin: {
            options: {
                progressive: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>/img',
                    src: '**/*.{jpg,jpeg,png,gif}',
                    dest: '<%= app.dist %>/<%= app.baseurl %>/img'
                }]
            }
        },
        svgmin: {
            options: {
                plugins: [{
                    cleanupIDs: false
                }, {
                    collapseGroups: false
                }, {
                    addClassesToSVGElement: false
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>/img',
                    src: '**/*.svg',
                    dest: '<%= app.dist %>/<%= app.baseurl %>/img'
                }]
            }
        },
        copy: {
            server: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= app.source %>',
                    src: ['img/**/*'],
                    dest: '.tmp/<%= app.baseurl %>'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'bower_components/bootstrap-sass/assets/javascripts',
                    src: 'bootstrap.min.js',
                    dest: '<%= app.dist %>/<%= app.baseurl %>/js'
                }, {
                    expand: true,
                    cwd: 'bower_components/jquery/dist',
                    src: ['jquery.min.js', 'jquery.min.map'],
                    dest: '<%= app.dist %>/<%= app.baseurl %>/js'
                }, {
                    expand: true,
                    cwd: 'app/_static',
                    src: ['*'],
                    dest: '<%= app.dist %>/<%= app.baseurl %>'
                }]
            }
        },
        buildcontrol: {
            dist: {
                options: {
                    dir: '<%= app.dist %>/<%= app.baseurl %>',
                    remote: '<%= app.git_repo %>',
                    branch: '<%= app.branch %>',
                    commit: true,
                    push: true,
                    connectCommits: false
                }
            }
        }
    });

    // Define Tasks
    grunt.registerTask('serve', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'browserSync:dist']);
        }

        grunt.task.run([
            'clean:server',
            'jekyll:server',
            'copy:server',
            'sass:server',
            'autoprefixer:server',
            'uglify:server',
            'browserSync:server',
            'watch'
        ]);
    });

    grunt.registerTask('server', function() {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve']);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'jekyll:dist',
        'imagemin',
        'svgmin',
        'uglify:dist',
        'sass:dist',
        'autoprefixer:dist',
        'cssmin',
        'critical',
        'copy:dist',
        'htmlmin',
        'swPrecache'
    ]);

    grunt.registerTask('deploy', [
        'build',
        'buildcontrol'
    ]);

    grunt.registerTask('default', [
        'serve'
    ]);
};
