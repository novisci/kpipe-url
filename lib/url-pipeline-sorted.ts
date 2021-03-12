/***
 * Return a PipelinePromise by supplying in input URL, output URL, and an arrray of transforms.
 *  The pipeline content can be optionally specified to match the expected stream content of the
 *  supplied transforms. Valid content types are 'buffer', 'strings', and 'json' (defaults to 'json').
 */
import { PipelinePromise } from 'kpipe-sequence'
import { Observe } from 'kpipe-streams'
import { urlInStreams, UrlInStreamsOpts } from './url-instreams'
import { urlOutStreams, UrlOutStreamsOpts } from './url-outstreams'
import { urlOutMultiplex } from './url-outmultiplex'
import { ContentType, ContentTypeNames } from './stream-url'
import { contentModifiers } from './content-modifiers'
import { parseUrl } from './parse-url'
import { ExternalSort } from './external-sort'
import stream from 'stream'

export interface UrlPipelineSortedOpts extends UrlInStreamsOpts, UrlOutStreamsOpts {
  inContent?: ContentType
  outContent?: ContentType
  pipelineStats?: boolean
  statsLabel?: string
  multiplex?: boolean
}

const urlType = (url: string) => parseUrl(url).protocol

export function urlPipelineSorted (inUrl: string, outUrl: string, transforms: stream.Stream[]  = [], opts: UrlPipelineSortedOpts): Promise<void> {
  if (!Array.isArray(transforms)) {
    throw Error('UrlPipeline expects transforms to be an array of object Transform streams')
  }

  const {
    inContent, outContent,
    content = 'json',
    pipelineStats = true,
    statsLabel = 'url-pipeline',
    multiplex = false,
    ...rest
  } = opts

  const inputContent: ContentType = inContent || content || 'json'
  const outputContent: ContentType = outContent || content || 'json'

  if (typeof inContent === 'undefined') {
    throw(Error(`Undefined inContent in urlPipelineSorted()`))
  }

  if (!ContentTypeNames.includes(inputContent) || !ContentTypeNames.includes(outputContent)) {
    throw Error(`Invalid content types I:${inputContent} O:${outputContent}`)
  }

  if (urlType(inUrl) === 'kafka' && inputContent === 'buffer') {
    throw Error('Kafka read streams do not support content \'buffer\'')
  }
  if (urlType(outUrl) === 'kafka' && outputContent === 'buffer') {
    throw Error('Kafka write streams do not support content \'buffer\'')
  }

  const externalSort = new ExternalSort()

  // const writerOpts = { content: outputContent, ...rest }

  let writeStream: NodeJS.WritableStream
  if (multiplex) {
    writeStream = urlOutMultiplex(outUrl, {
      content: 'json',
      cbMultiplex: (event) => {
        if (Array.isArray(event) && typeof event[event.length - 1] === 'object') {
          const eventObj = event[event.length - 1]
          if (eventObj.errors) {
            return 'Error'
          }
          return event[event.length - 1].domain || 'Unknown'
        }
        return 'Unknown'
      },
      ...rest
    })
  } else {
    writeStream = urlOutStreams(outUrl, {
      content: 'json',
      ...rest
    })
  }

  // Return the Promise<pipeline>
  return PipelinePromise( ...[
      // Just retrieve the incoming stream as strings
      urlInStreams(inUrl, { content: 'buffer', ...rest }),
      // Insert pipeline stats
      pipelineStats && Observe.PipelineStats({
        objectMode: true,
        label: statsLabel + '-read',
        intervalMs: 5000
      }),
      // Write to external sort incoming
      externalSort.createWriteStream()
    ].filter(Boolean)
  )
    // Perform the external sort
    .then(() => externalSort.sort())
    .then(() => {
      return PipelinePromise( ...[
          externalSort.createReadStream(),
          // Convert the sorted strings into the desired inputContent content type
          ...contentModifiers('buffer', inputContent),
          // Apply the supplied transforms
          ...transforms,
          // Insert pipeline stats
          pipelineStats && Observe.PipelineStats({
            objectMode: true,
            label: statsLabel + '-write',
            intervalMs: 5000
          }),
          // Convert to outputContent and write to stream
          writeStream
        ].filter(Boolean)
      )
    })
    .then(() => {
      if (urlType(outUrl) === 'kafka') {
        return require('kpipe-core').KafkaProducer.flush()
      }
    })
    .finally(() => {
      if (urlType(outUrl) === 'kafka') {
        console.info('Disconnecting Kafka producer and flushing temporary files')
        return require('kpipe-core').KafkaProducer.disconnect()
          .then(() => externalSort.flush())
      } else {
        console.info('Flushing temporary files')
        return externalSort.flush()
      }
    })
}
