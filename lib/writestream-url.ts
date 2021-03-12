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
 *  kafka://
 */
import { writerUrl } from './writer-url'
import { compressExt } from './compress-ext'
import { WriterOpts } from 'kpipe-core'

export interface WriteStreamUrlOpts extends WriterOpts {
  compress?: boolean
}

export function writeStreamUrl (url: string, { compress, ...writerOpts }: WriteStreamUrlOpts) {
  const writer = writerUrl(url, writerOpts)

  compress = typeof compress === 'undefined' ? true : !!compress

  const stream = writer(...writer.streamOpts())

  let outStream = stream
  if (compress && ['s3', 'fs'].includes(writer.type())) {
    outStream = compressExt(writer.streamOpts()[0])
    outStream.pipe(stream)
  }

  outStream.filename = () => writer.streamOpts()[0]
  outStream.type = writer.type

  return outStream
}
