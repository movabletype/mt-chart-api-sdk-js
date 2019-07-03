[![Build Status](https://travis-ci.org/movabletype/mt-chart-api-sdk-js.svg?branch=master)](https://travis-ci.org/movabletype/mt-chart-api-sdk-js)

This JavaScript library is for Movable Type Chart API.

# Development

## Prerequisites
Installation depends on [node](http://nodejs.org/), [npm](https://npmjs.org/), and [grunt-cli](http://gruntjs.com/)

To install node, see http://nodejs.org/ (If you are using Mac, you can install node via [homebrew](http://mxcl.github.io/homebrew/))

Then, you can install grunt-cli with npm like the following. When you have some error in installation, try sudo.

```
  [sudo] npm install -g grunt-cli
```

## Installation
`git clone git@github.com:movabletype/mt-data-api-js`, and move the directory you cloned, then execute the following command

```
  npm install
```

## Building for develop
grunt dev task generate scripts in lib and dist directory from src directory, and run the dependant tasks

```
  grunt dev
```

## Building for production
grunt build task generate optimized scrips in dist directory

```
  grunt build

  or 

  make build
```

# License
The MIT License (MIT)
