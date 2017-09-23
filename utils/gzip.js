const zlib = require('zlib');
const fs = require('fs');
const raw = fs.createReadStream('dist/index.js');
const write = fs.createWriteStream ('dist/index.js.gzip');
raw.pipe(zlib.createGzip()).pipe(write);