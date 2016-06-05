const fs = require('fs');
const browserify = require('browserify');
const distillify = require('../index');
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
