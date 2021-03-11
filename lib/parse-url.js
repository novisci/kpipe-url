"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.ProtocolNames = void 0;
/***
 * parse a kpipe storage url and return reader/writer parameters
 *
 * eg.
 *
 *  s3://bucket-name/pre/fix/object
 *
 *  fs://relative/path/from/cwd
 *
 *  fs:///absolute/path/to/file
 *
 *  stdio://
 *
 *  kafka://
 */
const protocolNames = {
    fs: 'fs',
    file: 'file',
    stdio: 'stdio',
    s3: 's3',
    kafka: 'kafka'
};
exports.ProtocolNames = Object.keys(protocolNames);
function safeMatch(url, regex, na = null) {
    const m = url.match(regex);
    if (!m) {
        return na;
    }
    return m[1];
}
// const first = (arr) => arr[0]
const last = (arr) => arr[arr.length - 1];
const protocol = (url) => {
    const p = safeMatch(url, /^([^:]+):\/\//);
    if (!p || !exports.ProtocolNames.includes(p)) {
        throw Error(`Indvalid protocol in parseUrl(): ${p}`);
    }
    return p;
};
const path = (url) => safeMatch(url, /^[^:]+:\/\/(.*)$/);
const pathcomps = (url) => (path(url) || '').split('/');
const prefixes = (url) => pathcomps(url).slice(0, -1);
const extension = (url) => safeMatch(url, /\.([^/.]+)$/);
const isAbsolute = (url) => pathcomps(url)[0] === '';
const isDir = (url) => last(pathcomps(url)) === '';
const file = (url) => last(pathcomps(url)) || null;
function parseUrl(url) {
    if (typeof url !== 'string' || url === '' || url === '-') {
        url = 'stdio://';
    }
    return {
        protocol: protocol(url),
        path: pathcomps(url),
        prefixes: prefixes(url),
        file: file(url),
        extension: extension(url),
        isAbsolute: isAbsolute(url),
        isDir: isDir(url)
    };
}
exports.parseUrl = parseUrl;
//# sourceMappingURL=parse-url.js.map