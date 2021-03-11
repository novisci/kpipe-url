import * as Streams from 'kpipe-streams'
import * as path from 'path'
import * as zlib from 'zlib'
import * as stream from 'stream'
import * as unzipper from 'unzipper'

/**
 * Infer decompression required based on filename extension
 */
module.exports = function (filename: string) {
  if (typeof filename === 'undefined') {
    throw Error('options.filename is required for decompress-ext')
  }
console.error('decompress-ext: ' + filename)
  switch (path.extname(filename)) {
    case '.zip':
      return unzipper.ParseOne()
    case '.snappy':
      return Streams.Transform.SnappyUncompress()
    case '.gz':
      console.info('DECOMPRESS Gunzip (.gz)')
      return zlib.createGunzip()
    default:
      return new stream.PassThrough()
  }
}
