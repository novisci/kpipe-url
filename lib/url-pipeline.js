"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlPipeline = void 0;
/***
 * Return a PipelinePromise by supplying in input URL, output URL, and an arrray of transforms.
 *  The pipeline content can be optionally specified to match the expected stream content of the
 *  supplied transforms. Valid content types are 'buffer', 'strings', and 'json' (defaults to 'json').
 */
const kpipe_sequence_1 = require("kpipe-sequence");
const kpipe_streams_1 = require("kpipe-streams");
const url_instreams_1 = require("./url-instreams");
const url_outstreams_1 = require("./url-outstreams");
const stream_url_d_1 = require("./stream-url.d");
const parse_url_1 = require("./parse-url");
const urlType = (url) => parse_url_1.parseUrl(url).protocol;
function urlPipeline(inUrl, outUrl, transforms = [], opts) {
    if (!Array.isArray(transforms)) {
        throw Error('UrlPipeline expects transforms to be an array of object Transform streams');
    }
    let { 
    // brokers, region, key, partSize, queueSize,
    inContent, outContent, content = 'json', pipelineStats = true, statsLabel = 'url-pipeline', ...rest } = opts;
    inContent = inContent || content || 'json';
    outContent = outContent || content || 'json';
    if (!stream_url_d_1.ContentTypeNames.includes(inContent) || !stream_url_d_1.ContentTypeNames.includes(outContent)) {
        throw Error(`Invalid content types I:${inContent} O:${outContent}`);
    }
    if (urlType(inUrl) === 'kafka' && inContent === 'buffer') {
        throw Error('Kafka read streams do not support content \'buffer\'');
    }
    if (urlType(outUrl) === 'kafka' && outContent === 'buffer') {
        throw Error('Kafka write streams do not support content \'buffer\'');
    }
    // Return the Promise<pipeline>
    const pipes = [
        // Determine the read stream and convert to desired inContent type
        url_instreams_1.urlInStreams(inUrl, { content: inContent, ...rest }),
        // Insert pipeline stats
        pipelineStats && kpipe_streams_1.Observe.PipelineStats({
            objectMode: inContent === 'strings' || inContent === 'json',
            label: statsLabel,
            intervalMs: 5000
        }),
        // Apply the supplied transforms
        ...transforms,
        // Convert from outContent type and add the write stream
        url_outstreams_1.urlOutStreams(outUrl, { content: outContent, ...rest })
    ].filter(Boolean);
    return kpipe_sequence_1.PipelinePromise(...pipes)
        .finally(() => {
        if (urlType(outUrl) === 'kafka') {
            require('kpipe-core').KafkaProducer.disconnect();
        }
    });
}
exports.urlPipeline = urlPipeline;
//# sourceMappingURL=url-pipeline.js.map