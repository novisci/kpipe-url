import * as Streams from 'kpipe-streams'
import * as path from 'path'
import * as zlib from 'zlib'
import * as stream from 'stream'
import * as unzipper from 'unzipper'

/**
 * Infer decompression required based on filename extension
 */
export function decompressExt (filename: string, { quiet }: { quiet?: boolean } = {}) {
  if (typeof filename === 'undefined') {
    throw Error('options.filename is required for decompress-ext')
  }

  switch (path.extname(filename)) {
    case '.zip':
      !quiet && console.info('DECOMPRESS Zip (.zip)')
      return unzipper.ParseOne()
    case '.snappy':
      !quiet && console.info('DECOMPRESS Snappy (.snappy)')
      return Streams.Transform.SnappyUncompress()
    case '.gz':
      !quiet && console.info('DECOMPRESS Gunzip (.gz)')
      return zlib.createGunzip()
    default:
      return new stream.PassThrough()
  }
}
