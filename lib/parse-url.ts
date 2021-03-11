/***
 * parse a kpipe storage url and return reader/writer parameters
 *
 * eg.
 *
 *  s3://bucket-name/pre/fix/object
 *
 *  fs://relative/path/from/cwd
 *
 *  fs:///absolute/path/to/file
 *
 *  stdio://
 *
 *  kafka://
 */
const protocolNames = {
  fs: 'fs',
  file: 'file',
  stdio: 'stdio',
  s3: 's3',
  kafka: 'kafka'
}
export const ProtocolNames = Object.keys(protocolNames)
export type ProtocolName = keyof typeof protocolNames

export interface ParsedUrl {
  protocol: ProtocolName
  path: string[]
  prefixes: string[]
  file: string
  extension: string | null
  isAbsolute: boolean
  isDir: boolean
}

function safeMatch (url: string, regex: RegExp, na = null) {
  const m = url.match(regex)
  if (!m) {
    return na
  }
  return m[1]
}

// const first = (arr) => arr[0]
const last = (arr: any[]) => arr[arr.length - 1]

const protocol = (url: string): ProtocolName => {
  const p = safeMatch(url, /^([^:]+):\/\//)
  if (!p || !ProtocolNames.includes(p)) {
    throw Error(`Indvalid protocol in parseUrl(): ${p}`)
  }
  return p as ProtocolName
}

const path = (url: string) => safeMatch(url, /^[^:]+:\/\/(.*)$/)
const pathcomps = (url: string) => (path(url) || '').split('/')
const prefixes = (url: string) => pathcomps(url).slice(0, -1)
const extension = (url: string) => safeMatch(url, /\.([^/.]+)$/)
const isAbsolute = (url: string) => pathcomps(url)[0] === ''
const isDir = (url: string) => last(pathcomps(url)) === ''
const file = (url: string) => last(pathcomps(url)) || null

export function parseUrl (url: string): ParsedUrl {
  if (typeof url !== 'string' || url === '' || url === '-') {
    url = 'stdio://'
  }
  return {
    protocol: protocol(url),
    path: pathcomps(url),
    prefixes: prefixes(url),
    file: file(url),
    extension: extension(url),
    isAbsolute: isAbsolute(url),
    isDir: isDir(url)
  }
}
