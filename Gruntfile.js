module.exports = function (grunt) {
  'use strict';

  require('matchdep').filterDev('grunt-*').forEach(function (name) {
    if (!/template/.test(name)) {
      grunt.loadNpmTasks(name);
    }
  });

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
    jasmine: {
      options: {
        keepRunner: true,
        specs: 'spec/**/*.js',
        helpers: grunt.file.expand('sample/js/*.js').concat(grunt.file.expand('deps/*.js')).concat(['spec_helpers/moment.min.js'])
      },
      test: {
        src: 'lib/core/mtchart.core.js'
      },
      coverage: {
        src: 'lib/core/mtchart.core.js',
        options: {
          host: 'http://localhost:3000/',
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: 'test/coverage/coverage.json',
            report: 'test/coverage',
          }
        }
      }
    }
  });
  grunt.registerTask('build', ['clean', 'preprocess', 'copy', 'cssmin', 'uglify']);
};
