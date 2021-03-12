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
exports.contentModifiers = void 0;
const stream_url_d_1 = require("./stream-url.d");
const Streams = __importStar(require("kpipe-streams"));
/***
 * Return an array of transforms which convert between different content types
 */
function contentModifiers(srcContent, dstContent) {
    if (!stream_url_d_1.ContentTypeNames.includes(srcContent) ||
        !stream_url_d_1.ContentTypeNames.includes(dstContent)) {
        throw Error(`Invalid content type S:${srcContent} D:${dstContent}`);
    }
    const xforms = [];
    if (srcContent === dstContent) {
        return xforms;
    }
    switch (srcContent) {
        case 'buffer':
            xforms.push(Streams.Transform.Delineate());
            if (dstContent === 'json') {
                xforms.push(Streams.Transform.JSONParse());
            }
            break;
        case 'strings':
            switch (dstContent) {
                case 'buffer':
                    xforms.push(Streams.Transform.Lineate());
                    break;
                case 'json':
                    xforms.push(Streams.Transform.JSONParse());
                    break;
            }
            break;
        case 'json':
            xforms.push(Streams.Transform.JSONStringify());
            if (dstContent === 'buffer') {
                xforms.push(Streams.Transform.Lineate());
            }
            break;
    }
    return xforms;
}
exports.contentModifiers = contentModifiers;
//# sourceMappingURL=content-modifiers.js.map