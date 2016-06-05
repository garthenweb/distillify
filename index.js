const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const pack = require('browser-pack')({ raw: true, hasExports: true });
const minimatch = require('minimatch');
const through = require('through2');

const cwd = process.cwd();

function shouldExternalize(file, externalizePattern) {
  const relFilePath = path.relative(cwd, file);
  const unixFilePath = relFilePath.split(path.sep).join('/');
  return minimatch(unixFilePath, externalizePattern);
}

function hash(value) {
  return crypto.createHash('md5').update(value).digest('hex');
}

const distillify = (b, opts) => {
  const outputFile = opts.outputs.file;
  const externalizePattern = opts.outputs.pattern;

  const deps = through.obj();
  const depMap = new Map();
  b.pipeline.get('deps').push(through.obj(
    function(row, enc, next) {
      const { file } = row;
      if (shouldExternalize(file, externalizePattern)) {
        row.id = hash(row.file);
        deps.push(row);
      } else {
        // store external dependency paths
        Object.keys(row.deps).forEach(name => {
          const path = row.deps[name];
          if (shouldExternalize(path, externalizePattern)) {
            depMap.set(name, hash(path));
          }
        });
        this.push(row);
      }

      next();
    },
    cb => {
      deps.end();
      cb();
    }
  ));

  const packStream = deps.pipe(pack);
  if (typeof outputFile === 'string') {
    // assume the string is a path and it should write the date into a file
    packStream.pipe(fs.createWriteStream(outputFile));
  } else {
    // assume that its a function that should handle the output
    outputFile(packStream);
  }

  b.pipeline.get('label').splice(0, 1, through.obj(function(row, enc, next) {
    // override row dependencies if path is available in depsMap
    row.deps = Object.keys(row.deps).reduce((deps, name) => {
      if (depMap.has(name)) {
        deps[name] = depMap.get(name);
      }
      return deps;
    }, row.deps);

    this.push(row);
    next();
  }));

  return b;
};

module.exports = distillify;
