"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writerUrl = void 0;
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
 *  kafka://topic/partition
 */
const kpipe_core_1 = require("kpipe-core");
const parse_url_1 = require("./parse-url");
const path_1 = __importDefault(require("path"));
function writerUrl(url, { ...writerOpts } = {}) {
    const purl = parse_url_1.parseUrl(url);
    const proto = purl.protocol;
    if (!proto || typeof proto !== 'string' || !['stdio', 'fs', 'file', 's3', 'kafka'].includes(proto)) {
        throw Error(`Invalid url type "${proto}" from "${url}"`);
    }
    const type = (proto === 'file') ? 'fs' : proto;
    let writer;
    switch (type) {
        case 'stdio':
            writer = kpipe_core_1.Writer({ type: 'stdio', ...writerOpts });
            writer.streamOpts = () => [''];
            break;
        case 'fs':
            writer = kpipe_core_1.Writer({
                type: 'fs',
                prefix: (purl.isAbsolute ? '/' : '') + path_1.default.join(...purl.prefixes),
                ...writerOpts
            });
            writer.streamOpts = () => [purl.file];
            break;
        case 's3':
            writer = kpipe_core_1.Writer({
                type: 's3',
                region: process.env.KPIPE_S3REGION || 'us-east-1',
                bucket: purl.prefixes[0],
                prefix: path_1.default.join(...purl.prefixes.slice(1)),
                ...writerOpts
            });
            writer.prefix = () => path_1.default.join(...purl.prefixes.slice(1));
            writer.streamOpts = () => [purl.file];
            break;
        case 'kafka':
            {
                writer = kpipe_core_1.Writer({
                    type: 'kafka',
                    ...writerOpts
                });
                const opts = [purl.path[0]];
                if (purl.path[1]) {
                    opts.push(parseInt(purl.path[1], 10));
                }
                writer.streamOpts = () => opts;
            }
            break;
        default:
            throw Error(`Invalid writer-url backend type: ${type}`);
    }
    console.debug(writer);
    writer.type = () => type;
    if (!writer.prefix) {
        writer.prefix = () => '';
    }
    writer.url = () => url;
    if (typeof writer.url !== 'function' ||
        typeof writer.type !== 'function' ||
        typeof writer.prefix !== 'function' ||
        typeof writer.streamOpts !== 'function') {
        throw Error(`Writer does not contain all helper functions in writerUrl()`);
    }
    return writer;
}
exports.writerUrl = writerUrl;
//# sourceMappingURL=writer-url.js.map