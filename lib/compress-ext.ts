import * as Streams from 'kpipe-streams'
import * as path from 'path'
import * as zlib from 'zlib'
import * as stream from 'stream'

/**
 * Infer compresstion required based on filename extension
 */
export function compressExt (filename: string, { quiet }: { quiet?: boolean } = {}): stream.Stream {
  if (typeof filename === 'undefined') {
    throw Error('options.filename is required for compress-ext')
  }

  switch (path.extname(filename)) {
    case '.zip':
      !quiet && console.info('COMPRESS Zip (.zip)')
      throw Error('Zip file extension is not supported by compress-ext')
    case '.snappy':
      !quiet && console.info('COMPRESS Snappy (.snappy)')
      return Streams.Transform.SnappyCompress()
    case '.gz':
      !quiet && console.info('COMPRESS Gzip (.gz)')
      return zlib.createGzip()
    default:
      return new stream.PassThrough()
  }
}
