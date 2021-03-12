/***
 * Return a readable stream array given a kpipe url. Handle decompression based on file extension (files, s3).
 *  Add transforms necessary to produce the supplied content type
 */
import { contentModifiers } from './content-modifiers'
import { ContentType, ContentTypeNames } from './stream-url'
import { readStreamUrl, ReadStreamUrlOpts } from './readstream-url'

export interface UrlInStreamsOpts extends ReadStreamUrlOpts {
  content?: ContentType
}

export function urlInStreams (url: string, { content, ...rest }: UrlInStreamsOpts): NodeJS.ReadableStream {
  content = content || 'json'

  if (!ContentTypeNames.includes(content)) {
    throw Error(`Invalid content type I:${content}`)
  }

  const readStream = readStreamUrl(url, { ...rest })

  const streamArray = [
    readStream,
    ...contentModifiers(readStream.type() === 'kafka' ? 'strings' : 'buffer', content)
  ]
  // Pipe the streams together and return the tail of the pipe
  streamArray.reduce((a, c) => a.pipe(c))
  return streamArray[streamArray.length - 1]
}
