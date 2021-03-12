"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalSort = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uid_safe_1 = __importDefault(require("uid-safe"));
class ExternalSort {
    constructor(workDir) {
        this._workDir = path_1.default.join(workDir || '.', 'sort-' + uid_safe_1.default.sync(6));
        fs_1.default.mkdirSync(this._workDir, { recursive: true });
        this._workFile = path_1.default.join(this._workDir, 'infile');
        this._outFile = path_1.default.join(this._workDir, 'outfile');
    }
    createWriteStream() {
        return fs_1.default.createWriteStream(this._workFile);
    }
    async sort() {
        console.error(`Sorting ${this._workFile} to ${this._outFile}`);
        return new Promise((resolve, reject) => {
            const child = child_process_1.spawn('sort', ['-T', this._workDir, '-o', this._outFile, this._workFile], {
                stdio: ['ignore', process.stderr, process.stderr]
            });
            child.on('error', (error) => {
                console.error(`error: ${error.message}`);
                child.kill();
                reject(error);
            });
            child.on('close', (code) => {
                console.info(`sort process exited with code ${code}`);
                resolve();
            });
        });
    }
    createReadStream() {
        return fs_1.default.createReadStream(this._outFile);
    }
    async flush() {
        console.error(`Removing temporary work dir: ${this._workDir}`);
        return new Promise((resolve, reject) => {
            child_process_1.exec(`rm -rvf ${this._workDir}`, (error, stdout, stderr) => {
                if (error) {
                    reject(Error(`exec error: ${error}`));
                    return;
                }
                console.info(`stdout: ${stdout}`);
                console.info(`stderr: ${stderr}`);
                resolve();
            });
        })
            .catch((err) => {
            console.error('Directory removal failed');
            console.error(err);
        });
    }
}
exports.ExternalSort = ExternalSort;
//# sourceMappingURL=external-sort.js.map