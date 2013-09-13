module.exports = function (grunt) {
  'use strict';

  require('matchdep').filterDev('grunt-*').forEach(function (name) {
    if (!/template/.test(name)) {
      grunt.loadNpmTasks(name);
    }
  });

  var moment = require('moment');

  // Project configuration.
  grunt.initConfig({
    watch: {
      preprocess: {
        files: ['src/**.js'],
        tasks: ['preprocess']
      },
      css: {
        files: ['css/**.css'],
        tasks: ['cssmin']
      }
    },
    preprocess: {
      core: {
        files: {
          'lib/core/mtchart.core.js': 'src/build/mtchart.core.js'
        }
      },
      amd: {
        files: {
          'lib/core/amd/mtchart.core.amd.js': 'src/build/mtchart.core.amd.js'
        }
      },
      all: {
        files: {
          'lib/mtchart.js': 'src/build/mtchart.js'
        }
      },
      jasmine: {
        options: {
          inline: true,
          context: {
            today: moment().format('YYYY-MM-DD'),
            todayISO: moment().toISOString()
          }
        },
        files: {
          'spec/graph_data.json': 'spec/graph_data.preprocess'
        }
      }
    },
    clean: {
      build: ['lib']
    },
    copy: {
      build: {
        files: [{
          expand: true,
          src: ['deps/**'],
          dest: 'lib/'
        }]
      }
    },
    cssmin: {
      build: {
        files: {
          'lib/mtchart.css': ['css/morris.css', 'css/mtchart.css']
        }
      }
    },
    uglify: {
      options: {
        beautify: {
          width: 1000000
        },
        compress: {
          sequences: false,
          global_defs: {
            DEBUG: false
          },
          unsafe: true
        },
        warnings: true,
        mangle: true,
        unsafe: true
      },
      core: {
        files: {
          'lib/core/mtchart.core.min.js': ['lib/core/mtchart.core.js']
        }
      },
      amd: {
        files: {
          'lib/core/amd/mtchart.core.amd.min.js': ['lib/core/amd/mtchart.core.amd.js']
        }
      },
      all: {
        files: {
          'lib/mtchart.min.js': ['lib/mtchart.js']
        }
      }
    },
    connect: {
      jasmine: {
        options: {
          hostname: 'localhost',
          port: 9001,
          keepalive: true,
          middleware: function (connect, options) {
            return [
              function (req, res, next) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', '*');
                next();
              },
              connect.static(options.base),
              connect.directory(options.base)
            ];
          }
        }
      }
    },
    jasmine: {
      options: {
        host: 'http://localhost:9001/',
        keepRunner: true,
        specs: 'spec/**/*.js',
        helpers: grunt.file.expand('sample/js/*.js').concat(grunt.file.expand('deps/*.js'))
      },
      test: {
        src: 'lib/core/mtchart.core.js'
      },
      coverage: {
        src: 'lib/core/mtchart.core.js',
        options: {
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: 'test/coverage/coverage.json',
            report: 'test/coverage',
          }
        }
      }
    },
    karma: {
      jasmine: {
        browsers: grunt.option('browser') ? [grunt.option('browser')] : ['Chrome'],
        configFile: 'karma.conf.js'
      }
    }
  });
  grunt.registerTask('build', ['clean', 'preprocess', 'copy', 'cssmin', 'uglify']);
};
