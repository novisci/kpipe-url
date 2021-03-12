"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlOutStreams = void 0;
/***
 * Return a writable stream array given a kpipe url. Handle compression based on file extension (files, s3).
 *  Add transforms necessary to convert from supplied content type
 */
const content_modifiers_1 = require("./content-modifiers");
const stream_url_d_1 = require("./stream-url.d");
const writestream_url_1 = require("./writestream-url");
function urlOutStreams(url, { content, ...rest }) {
    content = content || 'json';
    if (!stream_url_d_1.ContentTypeNames.includes(content)) {
        throw Error(`Invalid content type O:${content}`);
    }
    const writeStream = writestream_url_1.writeStreamUrl(url, { ...rest });
    const streamArray = [
        ...content_modifiers_1.contentModifiers(content, writeStream.type() === 'kafka' ? 'strings' : 'buffer'),
        writeStream
    ];
    // Pipe the streams together and return the head of the pipe
    streamArray.reduce((a, c) => a.pipe(c));
    return streamArray[0];
}
exports.urlOutStreams = urlOutStreams;
//# sourceMappingURL=url-outstreams.js.map