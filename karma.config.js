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
        pattern: 'spec_helpers/moment.min.js',
        watched: false
      }, {
        pattern: 'sample/js/*.js',
        watched: false
      }, {
        pattern: 'deps/*.js',
        watched: false
      }, {
        pattern: 'lib/core/mtchart.core.js',
        watched: false
      },
      'spec/*'
    ],


    // list of files to exclude
    exclude: [
      '**/*.preprocess'
    ],


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
