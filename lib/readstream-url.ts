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
 *  kafka://
 */
import { readerUrl } from './reader-url'

export interface ReadStreamUrlOpts {
  decompress?: boolean
}

export function readStreamUrl (url: string, { decompress, ...readerOpts }: ReadStreamUrlOpts = {}) {
  const reader = readerUrl(url, readerOpts)

  decompress = typeof decompress === 'undefined' ? true : !!decompress

  const stream = reader(...reader.streamOpts())

  let inStream = stream
  if (decompress && ['s3', 'fs'].includes(reader.type())) {
    inStream = stream.pipe(require('./decompress-ext')(reader.streamOpts()[0]))
  }

  inStream.filename = () => reader.streamOpts()[0]
  inStream.type = reader.type

  return inStream
}
