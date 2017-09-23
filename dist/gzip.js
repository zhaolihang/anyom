const zlib = require('zlib');
const fs = require('fs');
const raw = fs.createReadStream('index.js');
const write = fs.createWriteStream ('index.js.gzip');
raw.pipe(zlib.createGzip()).pipe(write);