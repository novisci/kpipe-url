"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlOutMultiplex = void 0;
/***
 * Return a writable stream array given a kpipe url. Handle compression based on file extension (files, s3).
 *  Add transforms necessary to convert from supplied content type
 */
const content_modifiers_1 = require("./content-modifiers");
const stream_url_1 = require("./stream-url");
const compress_ext_1 = require("./compress-ext");
const writer_url_1 = require("./writer-url");
const stream_1 = require("stream");
function urlOutMultiplex(url, { cbMultiplex, compress = true, content = 'json', ...rest }) {
    if (!stream_url_1.ContentTypeNames.includes(content)) {
        throw Error(`Invalid content type O:${content}`);
    }
    if (typeof cbMultiplex !== 'function') {
        throw Error('url-outmultiplex requires options.cbMultiplex to be a function');
    }
    const writer = writer_url_1.writerUrl(url, { ...rest });
    if (!['s3', 'fs', 'kafka'].includes(writer.type())) {
        throw Error(`url-outmultiplex does not support writer type ${writer.type()}`);
    }
    if (writer.type() === 'kafka' && content === 'buffer') {
        throw Error('Kafka write streams do not support content \'buffer\'');
    }
    console.info(`MULTIPLEX: ${url}`);
    return multiplexedStream(writer, content, cbMultiplex, { compress });
}
exports.urlOutMultiplex = urlOutMultiplex;
// Create a mutiplex-able write stream which uses a callback to determine which
//  stream to forward data to
function multiplexedStream(writer, content, cbMultiplex, { compress }) {
    const outStreams = {};
    // Get or create a stream using the provided multiplex term
    function getStream(term) {
        if (!outStreams[term]) {
            const streamOpts = writer.streamOpts();
            switch (writer.type()) {
                case 's3':
                case 'fs':
                    streamOpts[0] = `${term}/${streamOpts[0]}`;
                    break;
                case 'kafka':
                    streamOpts[0] = `${streamOpts[0]}-${term}`;
                    break;
            }
            const stream = writer(...streamOpts);
            let writeStream = stream;
            if (compress && ['s3', 'fs'].includes(writer.type())) {
                writeStream = compress_ext_1.compressExt(writer.streamOpts()[0]);
                writeStream.pipe(stream);
            }
            writeStream.filename = () => writer.streamOpts()[0];
            writeStream.type = writer.type;
            const streamArray = content_modifiers_1.contentModifiers(content, writeStream.type() === 'kafka' ? 'strings' : 'buffer').concat([writeStream]);
            streamArray.reduce((a, c) => a.pipe(c));
            outStreams[term] = streamArray[0];
            console.info(`Created multiplexed stream "${term}"`);
        }
        return outStreams[term];
    }
    function writeMultiplexStream(chunk, enc, cb) {
        const multiTerm = cbMultiplex(chunk);
        if (typeof multiTerm !== 'string' || multiTerm.length === 0) {
            cb(Error(`Invalid multiplex term ${multiTerm}`));
            return;
        }
        const stream = getStream(multiTerm);
        if (stream.write(chunk) === false) {
            console.debug(`Stream ${multiTerm}: backpressure`);
            stream.once('drain', () => {
                console.debug(`Stream ${multiTerm}: drained`);
                cb();
            });
        }
        else {
            cb();
        }
    }
    // End all multiplexed streams and wait for completion
    function endMultipexStreams() {
        return Promise.all(Object.entries(outStreams).map((e) => {
            const term = e[0];
            const stream = e[1];
            return new Promise((resolve) => {
                stream.end();
                stream.once('complete', () => {
                    console.debug(`Multiplexed stream completed: ${term}`);
                    resolve();
                });
            });
        }));
    }
    const inputStream = new stream_1.Writable({
        objectMode: content !== 'buffer',
        write: writeMultiplexStream,
        final: (cb) => {
            endMultipexStreams()
                .then(() => {
                console.info('All multiplex streams complete. Closing stream');
                cb();
            })
                .catch((err) => {
                console.error(`Error closing multiplex streams: ${err.message}`);
                cb(err);
            });
        }
    });
    inputStream.on('error', (err) => {
        console.error(`Error event on multiplex input stream: ${err.message}`);
        endMultipexStreams()
            .then(() => {
            console.error('All multiplex streams complete. Closing stream');
        })
            .catch((err) => {
            console.error(`Error closing multiplex streams: ${err.message}`);
        });
    });
    return inputStream;
}
//# sourceMappingURL=url-outmultiplex.js.map