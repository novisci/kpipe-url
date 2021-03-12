/***
 * Return a writable stream array given a kpipe url. Handle compression based on file extension (files, s3).
 *  Add transforms necessary to convert from supplied content type
 */
import { contentModifiers } from './content-modifiers'
import { ContentType, ContentTypeNames } from './stream-url'
import { writeStreamUrl, WriteStreamUrlOpts } from './writestream-url'

export interface UrlOutStreamsOpts extends WriteStreamUrlOpts {
  content?: ContentType
}

export function urlOutStreams (url: string, { content, ...rest }: UrlOutStreamsOpts): NodeJS.WritableStream {
  content = content || 'json'

  if (!ContentTypeNames.includes(content)) {
    throw Error(`Invalid content type O:${content}`)
  }

  const writeStream = writeStreamUrl(url, { ...rest })

  const streamArray = [
    ...contentModifiers(content, writeStream.type() === 'kafka' ? 'strings' : 'buffer'),
    writeStream
  ]
  // Pipe the streams together and return the head of the pipe
  streamArray.reduce((a, c) => a.pipe(c))
  return streamArray[0]
}
