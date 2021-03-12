"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlInStreams = void 0;
/***
 * Return a readable stream array given a kpipe url. Handle decompression based on file extension (files, s3).
 *  Add transforms necessary to produce the supplied content type
 */
const content_modifiers_1 = require("./content-modifiers");
const stream_url_1 = require("./stream-url");
const readstream_url_1 = require("./readstream-url");
function urlInStreams(url, { content, ...rest }) {
    content = content || 'json';
    if (!stream_url_1.ContentTypeNames.includes(content)) {
        throw Error(`Invalid content type I:${content}`);
    }
    const readStream = readstream_url_1.readStreamUrl(url, { ...rest });
    const streamArray = [
        readStream,
        ...content_modifiers_1.contentModifiers(readStream.type() === 'kafka' ? 'strings' : 'buffer', content)
    ];
    // Pipe the streams together and return the tail of the pipe
    streamArray.reduce((a, c) => a.pipe(c));
    return streamArray[streamArray.length - 1];
}
exports.urlInStreams = urlInStreams;
//# sourceMappingURL=url-instreams.js.map