
/***
 * kpipe-sequence
 */
declare module 'kpipe-sequence' {
  import streams from 'streams'
  type AsyncFn = function (any): Promise<any>
  type Listener = function (...any[]): void

  type PromiseEmitterEvent = 'notify' | 'report'

  export interface PromiseEmitter extends Promise<void> {
    on (name: PromiseEmitterEvent, Listener): void
    off (name: PromiseEmitterEvent, Listener): void
    emit (name: PromiseEmitterEvent, ...args: any[]): void
  }
  declare namespace KpipeSequence {
    declare function PromiseChain ( initialValue: any, ...fns: AsyncFn[]): Promise<any>
    declare function PipelinePromise (...args: streams.Stream[]): PromiseEmitter
  }

  export = KpipeSequence
}