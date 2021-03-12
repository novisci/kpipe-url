/***
 * Return a PipelinePromise by supplying in input URL, output URL, and an arrray of transforms.
 *  The pipeline content can be optionally specified to match the expected stream content of the
 *  supplied transforms. Valid content types are 'buffer', 'strings', and 'json' (defaults to 'json').
 */
import { PipelinePromise } from 'kpipe-sequence'
import { Observe } from 'kpipe-streams'
import { urlInStreams, UrlInStreamsOpts } from './url-instreams'
import { urlOutStreams, UrlOutStreamsOpts } from './url-outstreams'
import { ContentType, ContentTypeNames } from './stream-url.d'
import { parseUrl, ProtocolName } from './parse-url'

const urlType = (url: string): ProtocolName => parseUrl(url).protocol

export interface UrlPipelineOpts extends UrlInStreamsOpts, UrlOutStreamsOpts {
  inContent?: ContentType
  outContent?: ContentType
  pipelineStats?: boolean
  statsLabel?: string
}

export function urlPipeline (inUrl: string, outUrl: string, transforms = [], opts: UrlPipelineOpts): Promise<void> {
  if (!Array.isArray(transforms)) {
    throw Error('UrlPipeline expects transforms to be an array of object Transform streams')
  }

  let {
    // brokers, region, key, partSize, queueSize,
    inContent, outContent,
    content = 'json',
    pipelineStats = true,
    statsLabel = 'url-pipeline',
    ...rest
  } = opts

  inContent = inContent || content || 'json'
  outContent = outContent || content || 'json'

  if (!ContentTypeNames.includes(inContent) || !ContentTypeNames.includes(outContent)) {
    throw Error(`Invalid content types I:${inContent} O:${outContent}`)
  }

  if (urlType(inUrl) === 'kafka' && inContent === 'buffer') {
    throw Error('Kafka read streams do not support content \'buffer\'')
  }
  if (urlType(outUrl) === 'kafka' && outContent === 'buffer') {
    throw Error('Kafka write streams do not support content \'buffer\'')
  }

  // Return the Promise<pipeline>
  const pipes = [
    // Determine the read stream and convert to desired inContent type
    urlInStreams(inUrl, { content: inContent, ...rest }),
    // Insert pipeline stats
    pipelineStats && Observe.PipelineStats({
      objectMode: inContent === 'strings' || inContent === 'json',
      label: statsLabel,
      intervalMs: 5000
    }),
    // Apply the supplied transforms
    ...transforms,
    // Convert from outContent type and add the write stream
    urlOutStreams(outUrl, { content: outContent, ...rest })
  ].filter(Boolean)

  return PipelinePromise( ...pipes )
    .finally(() => {
      if (urlType(outUrl) === 'kafka') {
        require('kpipe-core').KafkaProducer.disconnect()
      }
    })
}
