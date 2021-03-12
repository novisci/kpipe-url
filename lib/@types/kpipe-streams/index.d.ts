/***
 * kpipe-streams
 */
declare module 'kpipe-streams' {
  import stream from 'stream'

  declare namespace KpipeStreams {
    export namespace Observe {
      interface PipelineStatsOpts {
        intervalMs?: number
        objectMode?: boolean
        label?: string
      }
      declare function PipelineStats (opts?: PipelineStatsOpts): stream.Transform
    }

    export namespace Transform {
      declare function Compact (opts?): StreamCreateFn
      declare function Delineate (opts?): StreamCreateFn
      declare function Gunzip (opts?): StreamCreateFn
      declare function Gzip (opts?): StreamCreateFn
      declare function JSONParse (opts?): StreamCreateFn
      declare function JSONStringify (opts?): StreamCreateFn
      declare function Lineate (opts?): StreamCreateFn
      declare function SnappyCompress (opts?): StreamCreateFn
      declare function SnappyUncompress (opts?): StreamCreateFn
      declare function Value (opts?): StreamCreateFn
    }

    export function Switch (options?): StreamCreateFn
    export function Partition (options?): StreamCreateFn
    export function PartSequence (options?): StreamCreateFn
  }

  export = KpipeStreams
}

