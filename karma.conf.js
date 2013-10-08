// Karma configuration
// Generated on Thu Sep 12 2013 11:43:08 GMT+0900 (JST)

module.exports = function (config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '.',


    // frameworks to use
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [{
        pattern: 'sample/js/*.js',
        watched: false
      }, {
        pattern: 'sample/js/*.min.map',
        included: false,
        served: true
      }, {
        pattern: 'lib/mtchart.min.js',
        watched: false
      }, {
        pattern: 'spec/*.json',
        watched: false,
        included: false,
        served: true
      }, {
        pattern: 'spec/*.template',
        watched: false,
        included: false,
        served: true
      }, {
        pattern: 'spec/*.hbs',
        watched: false,
        included: false,
        served: true
      }, {
        pattern: 'test/other_libs/**/*.js',
        served: true,
        included: false,
        watched: false
      }, {
        pattern: 'test/spec_helpers/*.js',
        watched: false
      }, {
        pattern: 'deps/*.js',
        served: true,
        included: false,
        watched: false
      }, {
        pattern: 'lib/mtchart.css',
        served: true,
        included: false,
        watched: false
      }, {
        pattern: 'sample/css/jquery-ui.min.css',
        served: true,
        included: false,
        watched: false
      }, {
        pattern: 'sample/css/images/*.png',
        served: true,
        included: false,
        watched: false
      },
      'spec/*.js'
    ],


    // list of files to exclude
    exclude: [],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome', 'Firefox'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
