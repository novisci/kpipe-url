"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentModifiers = exports.urlPipelineSorted = exports.urlPipeline = exports.urlOutMultiplex = exports.urlOutStreams = exports.urlInStreams = exports.compressExt = exports.parseUrl = exports.writeStreamUrl = exports.writerUrl = exports.readStreamUrl = exports.readerUrl = void 0;
var reader_url_1 = require("./lib/reader-url");
Object.defineProperty(exports, "readerUrl", { enumerable: true, get: function () { return reader_url_1.readerUrl; } });
var readstream_url_1 = require("./lib/readstream-url");
Object.defineProperty(exports, "readStreamUrl", { enumerable: true, get: function () { return readstream_url_1.readStreamUrl; } });
var writer_url_1 = require("./lib/writer-url");
Object.defineProperty(exports, "writerUrl", { enumerable: true, get: function () { return writer_url_1.writerUrl; } });
var writestream_url_1 = require("./lib/writestream-url");
Object.defineProperty(exports, "writeStreamUrl", { enumerable: true, get: function () { return writestream_url_1.writeStreamUrl; } });
var parse_url_1 = require("./lib/parse-url");
Object.defineProperty(exports, "parseUrl", { enumerable: true, get: function () { return parse_url_1.parseUrl; } });
var compress_ext_1 = require("./lib/compress-ext");
Object.defineProperty(exports, "compressExt", { enumerable: true, get: function () { return compress_ext_1.compressExt; } });
var url_instreams_1 = require("./lib/url-instreams");
Object.defineProperty(exports, "urlInStreams", { enumerable: true, get: function () { return url_instreams_1.urlInStreams; } });
var url_outstreams_1 = require("./lib/url-outstreams");
Object.defineProperty(exports, "urlOutStreams", { enumerable: true, get: function () { return url_outstreams_1.urlOutStreams; } });
var url_outmultiplex_1 = require("./lib/url-outmultiplex");
Object.defineProperty(exports, "urlOutMultiplex", { enumerable: true, get: function () { return url_outmultiplex_1.urlOutMultiplex; } });
var url_pipeline_1 = require("./lib/url-pipeline");
Object.defineProperty(exports, "urlPipeline", { enumerable: true, get: function () { return url_pipeline_1.urlPipeline; } });
var url_pipeline_sorted_1 = require("./lib/url-pipeline-sorted");
Object.defineProperty(exports, "urlPipelineSorted", { enumerable: true, get: function () { return url_pipeline_sorted_1.urlPipelineSorted; } });
var content_modifiers_1 = require("./lib/content-modifiers");
Object.defineProperty(exports, "contentModifiers", { enumerable: true, get: function () { return content_modifiers_1.contentModifiers; } });
// export = {
//   readerUrl, readStreamUrl,
//   writerUrl, writeStreamUrl,
//   parseUrl,
//   compressExt
// }
//# sourceMappingURL=index.js.map