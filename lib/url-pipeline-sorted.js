"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlPipelineSorted = void 0;
/***
 * Return a PipelinePromise by supplying in input URL, output URL, and an arrray of transforms.
 *  The pipeline content can be optionally specified to match the expected stream content of the
 *  supplied transforms. Valid content types are 'buffer', 'strings', and 'json' (defaults to 'json').
 */
const kpipe_sequence_1 = require("kpipe-sequence");
const kpipe_streams_1 = require("kpipe-streams");
const url_instreams_1 = require("./url-instreams");
const url_outstreams_1 = require("./url-outstreams");
const url_outmultiplex_1 = require("./url-outmultiplex");
const stream_url_1 = require("./stream-url");
const content_modifiers_1 = require("./content-modifiers");
const parse_url_1 = require("./parse-url");
const external_sort_1 = require("./external-sort");
const urlType = (url) => parse_url_1.parseUrl(url).protocol;
function urlPipelineSorted(inUrl, outUrl, transforms = [], opts) {
    if (!Array.isArray(transforms)) {
        throw Error('UrlPipeline expects transforms to be an array of object Transform streams');
    }
    const { inContent, outContent, content = 'json', pipelineStats = true, statsLabel = 'url-pipeline', multiplex = false, ...rest } = opts;
    const inputContent = inContent || content || 'json';
    const outputContent = outContent || content || 'json';
    if (typeof inputContent === 'undefined') {
        throw (Error(`Undefined inContent in urlPipelineSorted()`));
    }
    if (!stream_url_1.ContentTypeNames.includes(inputContent) || !stream_url_1.ContentTypeNames.includes(outputContent)) {
        throw Error(`Invalid content types I:${inputContent} O:${outputContent}`);
    }
    if (urlType(inUrl) === 'kafka' && inputContent === 'buffer') {
        throw Error('Kafka read streams do not support content \'buffer\'');
    }
    if (urlType(outUrl) === 'kafka' && outputContent === 'buffer') {
        throw Error('Kafka write streams do not support content \'buffer\'');
    }
    const externalSort = new external_sort_1.ExternalSort();
    // const writerOpts = { content: outputContent, ...rest }
    let writeStream;
    if (multiplex) {
        writeStream = url_outmultiplex_1.urlOutMultiplex(outUrl, {
            content: 'json',
            cbMultiplex: (event) => {
                if (Array.isArray(event) && typeof event[event.length - 1] === 'object') {
                    const eventObj = event[event.length - 1];
                    if (eventObj.errors) {
                        return 'Error';
                    }
                    return event[event.length - 1].domain || 'Unknown';
                }
                return 'Unknown';
            },
            ...rest
        });
    }
    else {
        writeStream = url_outstreams_1.urlOutStreams(outUrl, {
            content: 'json',
            ...rest
        });
    }
    // Return the Promise<pipeline>
    return kpipe_sequence_1.PipelinePromise(...[
        // Just retrieve the incoming stream as strings
        url_instreams_1.urlInStreams(inUrl, { content: 'buffer', ...rest }),
        // Insert pipeline stats
        pipelineStats && kpipe_streams_1.Observe.PipelineStats({
            objectMode: true,
            label: statsLabel + '-read',
            intervalMs: 5000
        }),
        // Write to external sort incoming
        externalSort.createWriteStream()
    ].filter(Boolean))
        // Perform the external sort
        .then(() => externalSort.sort())
        .then(() => {
        return kpipe_sequence_1.PipelinePromise(...[
            externalSort.createReadStream(),
            // Convert the sorted strings into the desired inputContent content type
            ...content_modifiers_1.contentModifiers('buffer', inputContent),
            // Apply the supplied transforms
            ...transforms,
            // Insert pipeline stats
            pipelineStats && kpipe_streams_1.Observe.PipelineStats({
                objectMode: true,
                label: statsLabel + '-write',
                intervalMs: 5000
            }),
            // Convert to outputContent and write to stream
            writeStream
        ].filter(Boolean));
    })
        .then(() => {
        if (urlType(outUrl) === 'kafka') {
            return require('kpipe-core').KafkaProducer.flush();
        }
    })
        .finally(() => {
        if (urlType(outUrl) === 'kafka') {
            console.info('Disconnecting Kafka producer and flushing temporary files');
            return require('kpipe-core').KafkaProducer.disconnect()
                .then(() => externalSort.flush());
        }
        else {
            console.info('Flushing temporary files');
            return externalSort.flush();
        }
    });
}
exports.urlPipelineSorted = urlPipelineSorted;
//# sourceMappingURL=url-pipeline-sorted.js.map