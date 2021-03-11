import { UrlStreamCreateFn } from './lib/stream-url.d'
import { ReadStreamUrlOpts } from './lib/readstream-url'
import { WriteStreamUrlOpts } from './lib/writestream-url'
import { ParsedUrl } from './lib/parse-url'
import stream from 'stream'

declare module 'kpipe-url' {
  export function readerUrl (url: string, opts): UrlStreamCreateFn
  export function readStreamUrl (url: string, opts: ReadStreamUrlOpts): stream.Stream
  export function writerUrl (url: string, opts): UrlStreamCreateFn
  export function writeStreamUrl (url: string, opts: WriteStreamUrlOpts): stream.Stream
  export function parseUrl (url: string): ParsedUrl
  export function compressExt (filename: string): stream.Stream 
}
