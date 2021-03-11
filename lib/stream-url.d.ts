import { Reader, StreamOpts, BackendType, StreamCreateFn } from 'kpipe-core'

interface UrlStreamCreate {
  streamOpts (): StreamOpts
  type (): BackendType
  url (): string
  prefix (): string
}

export interface UrlStreamCreateFn extends StreamCreateFn, UrlStreamCreate {}

export interface PartialUrlStreamCreateFn extends StreamCreateFn, Partial<UrlStreamCreate> {}

