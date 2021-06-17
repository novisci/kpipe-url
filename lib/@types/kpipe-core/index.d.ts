
/***
 * kpipe-core
 */
declare module 'kpipe-core' {
  import streams from 'streams'
  // Stream creator functions
  // export type StreamCreateArgs = [string, {}]
  export interface StreamCreateOpts { [key: string]: any }
  export type StreamOpts = [string, (number | { partition: number, offset: number })?]

  export interface StreamCreateFn {
    (...opts: StreamOpts): streams.Stream
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

  interface CommonBackendOpts {
    quiet?: boolean   // Quiet info logging (handy for multi-stream backends)
  }

  interface FsWriterOpts { prefix?: string }
  interface KafkaWriterOpts {
    brokers: string
    debug?: boolean
    objectMode?: boolean
    producerOpts?: { [key: string]: string | number }
    fnKey?: (any) => string | number | null
  }
  interface S3WriterOpts {
    bucket: string
    region: string
    prefix?: string
    key?: string
    queueSize?: number
    partSize?: number
  }
  export interface WriterOpts extends
    CommonBackendOpts,
    FsWriterOpts,
    KafkaWriterOpts,
    S3WriterOpts
  {}



  interface FsReaderOpts { prefix?: string }
  interface KafkaReaderOpts { 
    brokers: string
    groupid?: string
    commit?: boolean
    closeAtEnd?: boolean
    chunkSize?: number
    timeout?: number
    fullMessage?: boolean
    debug?: boolean
  }
  interface S3ReaderOpts {
    bucket: string
    region: string
    prefix?: string
  }

  export interface ReaderOpts extends 
    CommonBackendOpts,
    FsReaderOpts,
    KafkaReaderOpts,
    S3ReaderOpts
  {}

  export interface BackendCreateOpts {
    type: BackendType
    [key: string]: any
  }

  // declare namespace KpipeCore {
    export function Reader (opts?: BackendCreateOpts): StreamCreateFn
    export function Writer (opts?: BackendCreateOpts): StreamCreateFn

    declare namespace KafkaProducer {
      export async function connect ({ brokers, debug, ...options })
      export async function send (topic, message, key, partition)
      export async function flush (): void
      export async function disconnect (): void
      export function stats (): { [key: string]: number }
      export function deltaStats (prev: { [key: string]: number }): { [key: string]: number }
      export function metadata (): {}
    }

    export interface KafKaAdminClient {
      async createTopic (topic, nParts, nReplicas, options)
      async deleteTopic (topic)
      async createPartitions (topic, nParts)
    }

    export function KafkaAdmin ({brokers, ...options}): KafkaAdminClient
  // }

  // export = KpipeCore
}

