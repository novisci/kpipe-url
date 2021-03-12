"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeStreamUrl = void 0;
/***
 * return a writer by parsing a supplied URL
 *
 * eg.
 *
 *  s3://bucket-name/path/to/object
 *
 *  fs://relative/path/from/cwd
 *
 *  fs:///absolute/path/to/file
 *
 *  stdio://
 *
 *  kafka://
 */
const writer_url_1 = require("./writer-url");
const compress_ext_1 = require("./compress-ext");
function writeStreamUrl(url, { compress, ...writerOpts }) {
    const writer = writer_url_1.writerUrl(url, writerOpts);
    compress = typeof compress === 'undefined' ? true : !!compress;
    const stream = writer(...writer.streamOpts());
    let outStream = stream;
    if (compress && ['s3', 'fs'].includes(writer.type())) {
        outStream = compress_ext_1.compressExt(writer.streamOpts()[0]);
        outStream.pipe(stream);
    }
    outStream.filename = () => writer.streamOpts()[0];
    outStream.type = writer.type;
    return outStream;
}
exports.writeStreamUrl = writeStreamUrl;
//# sourceMappingURL=writestream-url.js.map