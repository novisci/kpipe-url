import { UrlStreamCreateFn } from './lib/stream-url.d'
import { ReadStreamUrlOpts } from './lib/readstream-url'
import { WriteStreamUrlOpts } from './lib/writestream-url'
import { ParsedUrl } from './lib/parse-url'
import { UrlInStreamsOpts } from './lib/url-instreams'
import { UrlOutStreamsOpts } from './lib/url-outstreams'
import { UrlOutMultiplexOpts } from './lib/url-outmultiplex'
import { UrlPipelineOpts } from './lib/url-pipeline'
import { UrlPipelineSortedOpts } from './lib/url-pipeline-sorted'
import stream from 'stream'

declare module 'kpipe-url' {
  export function readerUrl (url: string, opts): UrlStreamCreateFn
  export function readStreamUrl (url: string, opts: ReadStreamUrlOpts): stream.Stream
  export function writerUrl (url: string, opts): UrlStreamCreateFn
  export function writeStreamUrl (url: string, opts: WriteStreamUrlOpts): stream.Stream
  export function parseUrl (url: string): ParsedUrl
  export function compressExt (filename: string): stream.Stream
  export function urlInStreams (url: string, opts: UrlInStreamsOpts): NodeJS.ReadableStream
  export function urlOutStreams (url: string, opts: UrlOutStreamsOpts): NodeJS.WritableStream
  export function urlOutMultiplex (url: string, opts: UrlOutMultiplexOpts): NodeJS.WritableStream
  export function urlPipeline (inUrl: string, outUrl: string, transforms: stream.Transform[], opts: UrlPipelineOpts): Promise<void>
  export function urlPipelineSorted (inUrl: string, outUrl: string, transforms: stream.Transform[], opts: UrlPipelineSortedOpts): Promise<void>
}
