import { ContentType, ContentTypeNames } from './stream-url.d'
import * as Streams from 'kpipe-streams'
import stream from 'stream'

/***
 * Return an array of transforms which convert between different content types
 */


export function contentModifiers (srcContent: ContentType, dstContent: ContentType) {
  if (!ContentTypeNames.includes(srcContent) ||
    !ContentTypeNames.includes(dstContent)
  ) {
    throw Error(`Invalid content type S:${srcContent} D:${dstContent}`)
  }

  const xforms: stream.Transform[] = []

  if (srcContent === dstContent) {
    return xforms
  }

  switch (srcContent) {
    case 'buffer':
      xforms.push(Streams.Transform.Delineate())
      if (dstContent === 'json') {
        xforms.push(Streams.Transform.JSONParse())
      }
      break
    case 'strings':
      switch (dstContent) {
        case 'buffer':
          xforms.push(Streams.Transform.Lineate())
          break
        case 'json':
          xforms.push(Streams.Transform.JSONParse())
          break
      }
      break
    case 'json':
      xforms.push(Streams.Transform.JSONStringify())
      if (dstContent === 'buffer') {
        xforms.push(Streams.Transform.Lineate())
      }
      break
  }

  return xforms
}
