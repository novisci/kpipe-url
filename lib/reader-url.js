"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readerUrl = void 0;
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
 *  kafka://topic/partition/offset
 */
const kpipe_core_1 = require("kpipe-core");
const parse_url_1 = require("./parse-url");
const path_1 = __importDefault(require("path"));
function readerUrl(url, { ...readerOpts } = {}) {
    const purl = parse_url_1.parseUrl(url);
    const proto = purl.protocol;
    if (!proto || typeof proto !== 'string' || !['stdio', 'fs', 'file', 's3', 'kafka'].includes(proto)) {
        throw Error(`Invalid url type "${proto}" from "${url}"`);
    }
    const type = (proto === 'file') ? 'fs' : proto;
    let reader;
    switch (type) {
        case 'stdio':
            reader = kpipe_core_1.Reader({ type: 'stdio', ...readerOpts });
            reader.streamOpts = () => [''];
            break;
        case 'fs':
            reader = kpipe_core_1.Reader({
                type: 'fs',
                prefix: (purl.isAbsolute ? '/' : '') + path_1.default.join(...purl.prefixes),
                ...readerOpts
            });
            reader.streamOpts = () => [purl.file];
            break;
        case 's3':
            reader = kpipe_core_1.Reader({
                type: 's3',
                region: process.env.KPIPE_S3REGION || 'us-east-1',
                bucket: purl.prefixes[0],
                prefix: path_1.default.join(...purl.prefixes.slice(1)),
                ...readerOpts
            });
            reader.streamOpts = () => [purl.file];
            break;
        case 'kafka':
            {
                reader = kpipe_core_1.Reader({
                    type: 'kafka',
                    ...readerOpts
                });
                const opts = [purl.path[0]];
                if (purl.path[1]) {
                    opts.push({
                        partition: parseInt(purl.path[1], 10),
                        offset: typeof purl.path[2] !== 'undefined' ? parseInt(purl.path[2], 10) : 0
                    });
                }
                reader.streamOpts = () => opts;
            }
            break;
        default:
            throw Error(`Invalid reader-url backend type: ${type}`);
    }
    console.debug(reader);
    reader.type = () => type;
    reader.url = () => url;
    if (!reader.prefix) {
        reader.prefix = () => '';
    }
    if (typeof reader.url !== 'function' ||
        typeof reader.type !== 'function' ||
        typeof reader.prefix !== 'function' ||
        typeof reader.streamOpts !== 'function') {
        throw Error(`Reader does not contain all helper functions in readerUrl()`);
    }
    return reader;
}
exports.readerUrl = readerUrl;
//# sourceMappingURL=reader-url.js.map