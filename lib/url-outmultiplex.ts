/***
 * Return a writable stream array given a kpipe url. Handle compression based on file extension (files, s3).
 *  Add transforms necessary to convert from supplied content type
 */
import { contentModifiers } from './content-modifiers'
import { ContentType, ContentTypeNames, UrlStreamCreateFn } from './stream-url'
import { WriteStreamUrlOpts } from './writestream-url'
import { compressExt } from './compress-ext'
import { writerUrl } from './writer-url'
import { Writable } from 'stream'

export interface UrlOutMultiplexOpts extends WriteStreamUrlOpts {
  cbMultiplex: (chunk: any) => string
  content?: ContentType
}

export function urlOutMultiplex (url: string, {
  cbMultiplex,
  compress = true,
  content = 'json',
  ...rest
}: UrlOutMultiplexOpts): NodeJS.WritableStream {
  if (!ContentTypeNames.includes(content)) {
    throw Error(`Invalid content type O:${content}`)
  }

  if (typeof cbMultiplex !== 'function') {
    throw Error('url-outmultiplex requires options.cbMultiplex to be a function')
  }

  const writer = writerUrl(url, { ...rest })

  if (!['s3', 'fs', 'kafka'].includes(writer.type())) {
    throw Error(`url-outmultiplex does not support writer type ${writer.type()}`)
  }

  if (writer.type() === 'kafka' && content === 'buffer') {
    throw Error('Kafka write streams do not support content \'buffer\'')
  }

  return multiplexedStream(writer, content, cbMultiplex, { compress })
}

// Create a mutiplex-able write stream which uses a callback to determine which
//  stream to forward data to
function multiplexedStream (
  writer: UrlStreamCreateFn,
  content: ContentType,
  cbMultiplex: (chunk: any) => string,
  { compress }: { compress: boolean }
) {
  const outStreams: { [key: string]: NodeJS.WritableStream } = {}

  // Get or create a stream using the provided multiplex term
  function getStream (term: string) {
    if (!outStreams[term]) {
      const streamOpts = writer.streamOpts()
      switch (writer.type()) {
        case 's3':
          streamOpts[0] = `${term}/${streamOpts[0]}`
          break
        case 'fs':
          streamOpts[0] = `${term}-${streamOpts[0]}`
          break
        case 'kafka':
          streamOpts[0] = `${streamOpts[0]}-${term}`
          break
      }
      const stream = writer(...streamOpts)

      let writeStream = stream
      if (compress && ['s3', 'fs'].includes(writer.type())) {
        writeStream = compressExt(writer.streamOpts()[0])
        writeStream.pipe(stream)
      }
      writeStream.filename = () => writer.streamOpts()[0]
      writeStream.type = writer.type

      const streamArray = contentModifiers(content, writeStream.type() === 'kafka' ? 'strings' : 'buffer').concat([writeStream])
      streamArray.reduce((a, c) => a.pipe(c))
      outStreams[term] = streamArray[0]

      console.info(`Created multiplexed stream "${term}"`)
    }

    return outStreams[term]
  }

  /***
   * Emit an object to the multiplex stream whose name is
   *  determined by the cbMultiplex() callback.
   * 
   * Note: Backpressure detected when writing to a multiplex
   *  stream will apply backpressure to the input writable 
   *  stream until it drains.
   */
  type CallbackFn = (err?: Error) => void
  function writeMultiplexStream (chunk: any, enc: string | undefined, cb: CallbackFn) {
    const multiTerm = cbMultiplex(chunk)
    if (typeof multiTerm !== 'string' || multiTerm.length === 0) {
      cb(Error(`Invalid multiplex term ${multiTerm}`))
      return
    }
    const stream = getStream(multiTerm)
    if (stream.write(chunk) === false) {
      console.debug(`Stream ${multiTerm}: backpressure`)
      stream.once('drain', () => { 
        console.debug(`Stream ${multiTerm}: drained`)
        cb()
      })
    } else {
      cb()
    }
  }

  // End all multiplexed streams and wait for completion
  function endMultipexStreams (): Promise<void[]> {
    return Promise.all<void>(Object.entries(outStreams).map((e) => {
      const term = e[0]
      const stream = e[1]
      return new Promise((resolve) => {
        stream.end()
        stream.once('complete', () => {
          console.debug(`Multiplexed stream completed: ${term}`)
          resolve()
        })
      })
    }))
  }

  const inputStream = new Writable({
    objectMode: content !== 'buffer',
    write: writeMultiplexStream,
    final: (cb) => {
      endMultipexStreams()
        .then(() => {
          console.info('All multiplex streams complete. Closing stream')
          cb()
        })
        .catch((err) => {
          console.error(`Error closing multiplex streams: ${err.message}`)
          cb(err)
        })
    }
  })
  
  inputStream.on('error', (err: Error) => {
    console.error(`Error event on multiplex input stream: ${err.message}`)

    endMultipexStreams()
    .then(() => {
      console.error('All multiplex streams complete. Closing stream')
    })
    .catch((err) => {
      console.error(`Error closing multiplex streams: ${err.message}`)
    })
  })

  return inputStream
}
