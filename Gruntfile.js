/*global module:false*/
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
    jshint: {
      options: grunt.file.readJSON('.jshintrc'),
      gruntfile: {
        options: {
          es5: true,
          unused: false,
          evil: true
        },
        files: {
          src: ['Gruntfile.js']
        }
      },
      scripts: {
        files: {
          src: ['src/*.js']
        }
      }
    },
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
    connect: {
      jasmine: {
        options: {
          hostname: 'localhost',
          port: 9001,
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
      },
      coverage: {
        options: {
          hostname: 'localhost',
          port: 9002
        }
      }
    },
    jasmine: {
      options: {
        host: 'http://localhost:9001/',
        keepRunner: true,
        specs: 'spec/**/*.js',
        helpers: grunt.file.expand('sample/js/*.js').concat(grunt.file.expand('deps/*.js')).concat(grunt.file.expand('test/spec_helpers/*.js'))
      },
      test: {
        options: {
          specs: grunt.option('target') ? 'spec/' + grunt.option('target') + '.js' : 'spec/**/*.js'
        },
        src: 'lib/core/mtchart.core.js'
      },
      coverage: {
        src: 'lib/core/mtchart.core.js',
        options: {
          host: 'http://localhost:9002/',
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: 'test/coverage/coverage.json',
            report: 'test/coverage'
          }
        }
      }
    },
    karma: {
      jasmine: {
        browsers: grunt.option('browser') ? [grunt.option('browser')] : ['Chrome'],
        configFile: 'karma.conf.js'
      }
    },
    'compile-handlebars': {
      test_graph: {
        template: 'spec/graph_data.hbs',
        templateData: {
          days: (function () {
            var array = [];
            var today = moment();
            for (var i = 0; i < 10; i++) {
              var d = moment(today).subtract('day', i);
              array.push({
                x: d.format('YYYY-MM-DD'),
                iso: d.format(),
                y: Math.ceil(Math.random() * 100),
                y1: Math.ceil(Math.random() * 100),
                y2: Math.ceil(Math.random() * 100),
                y3: Math.ceil(Math.random() * 100)
              });
            }
            array[array.length - 1].last = true;
            return array;
          }())
        },
        output: 'spec/graph_data.json'
      },
      test_list: {
        template: 'spec/list_data.hbs',
        templateData: {
          days: (function () {
            var array = [];
            var today = moment();
            for (var i = 0; i < 10; i++) {
              var d = moment(today).subtract('day', i);
              array.push({
                x: d.format('YYYY-MM-DD'),
                date: d.lang('ja').format('LL'),
                title: 'Entry' + i,
                href: 'http://memolog.org/post/' + i
              });
            }
            array[array.length - 1].last = true;
            return array;
          }())
        },
        output: 'spec/list_data.json'
      }
    }
  });
  grunt.registerTask('test', ['preprocess', 'compile-handlebars:test_graph', 'compile-handlebars:test_list', 'connect:jasmine', 'jasmine:test']);
  grunt.registerTask('coverage', ['preprocess', 'compile-handlebars:test_graph', 'compile-handlebars:test_list', 'connect:coverage', 'jasmine:coverage']);
  grunt.registerTask('dev', ['clean', 'preprocess', 'cssmin']);
  grunt.registerTask('build', ['clean', 'preprocess', 'copy', 'cssmin', 'uglify']);
};
