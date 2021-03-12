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
 *  kafka://topic/partition
 */
import { Writer, StreamOpts, BackendType } from 'kpipe-core'
import { parseUrl } from './parse-url'
import path from 'path'
import { UrlStreamCreateFn, PartialUrlStreamCreateFn } from './stream-url'

export function writerUrl (url: string, { ...writerOpts } = {}): UrlStreamCreateFn {
  const purl = parseUrl(url)
  const proto = purl.protocol

  if (!proto || typeof proto !== 'string' || !['stdio', 'fs', 'file', 's3', 'kafka'].includes(proto)) {
    throw Error(`Invalid url type "${proto}" from "${url}"`)
  }
  const type: BackendType = (proto === 'file') ? 'fs' : proto

  let writer: PartialUrlStreamCreateFn

  switch (type) {
    case 'stdio':
      writer = Writer({ type: 'stdio', ...writerOpts })
      writer.streamOpts = () => ['']
      break
    case 'fs':
      writer = Writer({ 
        type: 'fs',
        prefix: (purl.isAbsolute ? '/' : '') + path.join(...purl.prefixes),
        ...writerOpts
      })
      writer.streamOpts = () => [purl.file]
      break
    case 's3':
      writer = Writer({
        type: 's3',
        region: process.env.KPIPE_S3REGION || 'us-east-1',
        bucket: purl.prefixes[0],
        prefix: path.join(...purl.prefixes.slice(1)),
        ...writerOpts
      })
      writer.prefix = () => path.join(...purl.prefixes.slice(1))
      writer.streamOpts = () => [purl.file]
      break
    case 'kafka': {
        writer = Writer({
          type: 'kafka',
          ...writerOpts
        })
        const opts: StreamOpts = [purl.path[0]]
        if (purl.path[1]) {
          opts.push(parseInt(purl.path[1], 10))
        }
        writer.streamOpts = () => opts
      }
      break
    default:
      throw Error(`Invalid writer-url backend type: ${type}`)
  }
  
  console.debug(writer)

  writer.type = () => type
  if (!writer.prefix) {
    writer.prefix = () => ''
  }

  writer.url = () => url

  if (typeof writer.url !== 'function' || 
    typeof writer.type !== 'function' ||
    typeof writer.prefix !== 'function' ||
    typeof writer.streamOpts !== 'function'
  ) {
    throw Error(`Writer does not contain all helper functions in writerUrl()`)
  }

  return writer as UrlStreamCreateFn
}
