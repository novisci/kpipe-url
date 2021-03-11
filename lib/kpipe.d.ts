declare module 'kpipe-streams' {
  declare namespace KpipeStreams {
    declare namespace Transform {
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

    declare function Switch (options?): StreamCreateFn
    declare function Partition (options?): StreamCreateFn
    declare function PartSequence (options?): StreamCreateFn
  }

  export = KpipeStreams
}

declare module 'kpipe-core' {
  // Stream creator functions
  // export type StreamCreateArgs = [string, {}]
  export interface StreamCreateOpts { [key: string]: any }
  export type StreamOpts = [string, (number | { partition: number, offset: number })?]

  export interface StreamCreateFn {
    (...opts: StreamOpts): NodeJS.Stream
  }

  // Backend types
  const backendTypes = {
    fs: 'fs',
    stdio: 'stdio',
    s3: 's3',
    kafka: 'kafka',
    buffer: 'buffer',
    random: 'random'
  }
  export const BackendTypeNames = Object.keys(backendTypes)
  export type BackendType = keyof typeof backendTypes
  
  // Backend creator functions
  export interface BackendCreateOpts {
    type: BackendType
    [key: string]: any
  }

  declare namespace KpipeCore {
    declare function Reader (opts?: BackendCreateOpts): StreamCreateFn
    declare function Writer (opts?: BackendCreateOpts): StreamCreateFn

    declare namespace KafkaProducer {
      declare async function connect ({ brokers, debug, ...options })
      declare async function send (topic, message, key, partition)
      declare async function flush (): void
      declare async function disconnect (): void
      declare function stats (): { [key: string]: number }
      declare function deltaStats (prev: { [key: string]: number }): { [key: string]: number }
      declare function metadata (): {}
    }

    interface KafKaAdminClient {
      async createTopic (topic, nParts, nReplicas, options)
      async deleteTopic (topic)
      async createPartitions (topic, nParts)
    }

    declare function KafkaAdmin ({brokers, ...options}): KafkaAdminClient
  }

  export = KpipeCore
}