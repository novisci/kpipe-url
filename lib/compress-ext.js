"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressExt = void 0;
const Streams = __importStar(require("kpipe-streams"));
const path = __importStar(require("path"));
const zlib = __importStar(require("zlib"));
const stream = __importStar(require("stream"));
/**
 * Infer compresstion required based on filename extension
 */
function compressExt(filename) {
    if (typeof filename === 'undefined') {
        throw Error('options.filename is required for compress-ext');
    }
    switch (path.extname(filename)) {
        case '.zip':
            throw Error('Zip file extension is not supported by compress-ext');
        case '.snappy':
            return Streams.Transform.SnappyCompress();
        case '.gz':
            console.info('COMPRESS Gzip (.gz)');
            return zlib.createGzip();
        default:
            return new stream.PassThrough();
    }
}
exports.compressExt = compressExt;
//# sourceMappingURL=compress-ext.js.map