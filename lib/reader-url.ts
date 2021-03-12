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
 *  kafka://topic/partition/offset
 */
import { Reader, StreamOpts, BackendType } from 'kpipe-core'
import { parseUrl } from './parse-url'
import path from 'path'
import { UrlStreamCreateFn, PartialUrlStreamCreateFn } from './stream-url'

export function readerUrl (url: string, { ...readerOpts } = {}): UrlStreamCreateFn {
  const purl = parseUrl(url)
  const proto = purl.protocol

  if (!proto || typeof proto !== 'string' || !['stdio', 'fs', 'file', 's3', 'kafka'].includes(proto)) {
    throw Error(`Invalid url type "${proto}" from "${url}"`)
  }
  const type: BackendType = (proto === 'file') ? 'fs' : proto

  let reader: PartialUrlStreamCreateFn

  switch (type) {
    case 'stdio':
      reader = Reader({ type: 'stdio', ...readerOpts })
      reader.streamOpts = () => ['']
      break
    case 'fs':
      reader = Reader({
        type: 'fs',
        prefix: (purl.isAbsolute ? '/' : '') + path.join(...purl.prefixes),
        ...readerOpts
      })
      reader.streamOpts = () => [purl.file]
      break
    case 's3':
      reader = Reader({
        type: 's3',
        region: process.env.KPIPE_S3REGION || 'us-east-1',
        bucket: purl.prefixes[0],
        prefix: path.join(...purl.prefixes.slice(1)),
        ...readerOpts
      })
      reader.streamOpts = () => [purl.file]
      break
    case 'kafka': {
        reader = Reader({
          type: 'kafka',
          ...readerOpts
        })
        const opts: StreamOpts = [purl.path[0]]
        if (purl.path[1]) {
          opts.push({
            partition: parseInt(purl.path[1], 10),
            offset: typeof purl.path[2] !== 'undefined' ? parseInt(purl.path[2], 10) : 0
          })
        }
        reader.streamOpts = () => opts
      }
      break
    default:
      throw Error(`Invalid reader-url backend type: ${type}`)
  }

  console.debug(reader)

  reader.type = () => type
  reader.url = () => url
  if (!reader.prefix) {
    reader.prefix = () => ''
  }

  if (typeof reader.url !== 'function' || 
    typeof reader.type !== 'function' ||
    typeof reader.prefix !== 'function' ||
    typeof reader.streamOpts !== 'function'
  ) {
    throw Error(`Reader does not contain all helper functions in readerUrl()`)
  }

  return reader as UrlStreamCreateFn
}
