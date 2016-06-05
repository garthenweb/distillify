# Distillify

A browserify plugin that splits your bundle into separate files.

## Caution

This is a first proof of concept and not battle tested. Its only tested in NodeJS v6 and will crash on lower versions due to ES2015 support.

## Installation

``` bash
npm install --save-dev distillify
```

## Usage

``` javascript
const fs = require('fs');
const browserify = require('browserify');
const distillify = require('distillify');
const b = browserify({ entries: ['example/entry.js']});
b.plugin(distillify, {
  outputs: {
    file: write('example/build.vendor.js'),
    pattern: 'node_modules/**',
  },
});

b.bundle().pipe(fs.createWriteStream('example/build.js'));

function write(outputFile) {
  return stream => stream.pipe(fs.createWriteStream(outputFile));
}
```

## Motivation

When updating your JavaScript application to introduce new features or fixing bugs you force your users to download the new code.

You might have parts of your application that are more frequently update than others. Often, those parts are external libraries.

When splitting your code into parts that are frequently updated and those that are not, your users need to download less JavaScript and will receive updates faster.

Distillify allows you to

* extract dependencies that should be extracted into another file by a pattern on the pathname
* only include those dependencies that need to be bundled with your code without further configuration
* integrate the code splitting without mayor changes to your existing code base

## License

Licensed under the [MIT License](https://opensource.org/licenses/mit-license.php).
