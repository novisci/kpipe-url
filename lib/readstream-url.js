"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readStreamUrl = void 0;
/***
 * return a reader by parsing a supplied URL
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
const reader_url_1 = require("./reader-url");
const decompress_ext_1 = require("./decompress-ext");
function readStreamUrl(url, { decompress, ...readerOpts }) {
    const reader = reader_url_1.readerUrl(url, readerOpts);
    decompress = typeof decompress === 'undefined' ? true : !!decompress;
    const stream = reader(...reader.streamOpts());
    let inStream = stream;
    if (decompress && ['s3', 'fs'].includes(reader.type())) {
        inStream = stream.pipe(decompress_ext_1.decompressExt(reader.streamOpts()[0], { quiet: readerOpts.quiet }));
    }
    inStream.filename = () => reader.streamOpts()[0];
    inStream.type = reader.type;
    return inStream;
}
exports.readStreamUrl = readStreamUrl;
//# sourceMappingURL=readstream-url.js.map