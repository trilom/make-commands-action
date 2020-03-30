import {PathLike} from 'fs'

export interface FsMock {
  writeFileSync: (
    path: string | number | Buffer | URL,
    data: any,
    options?:
    | string
    | {
      encoding?: string | null | undefined
      mode?: string | number | undefined
      flag?: string | undefined
    }
    | null
    | undefined
  ) => void
  readFileSync: (
    path: string | number | Buffer | URL,
    options:
    | string
    | {
      encoding: string
      flag?: string
    }
  ) => string
  readFile(path: string | number | Buffer | URL, options: string | {
    encoding: string;
    flag?: string | undefined;
  }, callback: (err: NodeJS.ErrnoException | null, data: string) => void): void
  readdirSync: (
    path: PathLike,
    options?:
    | 'utf8'
    | 'utf-8'
    | {
      encoding: BufferEncoding
      withFileTypes?: false
    }
    | 'ascii'
    | 'utf16le'
    | 'ucs2'
    | 'ucs-2'
    | 'base64'
    | 'latin1'
    | 'binary'
    | 'hex'
  ) => string[]
  existsSync: (path: PathLike) => boolean
  exists(path: PathLike, callback: (exists: boolean) => void): void
}
