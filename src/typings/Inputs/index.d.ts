import {PathLike} from 'fs'

export interface Inputs {
  commands?: InputCommands
  files: InputFiles
  options: InputOptions
}

export interface InputCommands {
  deploy?: string
  delete?: string
}
export interface InputFiles {
  [key:string]: PathLike[]
  all: PathLike[]
  added: PathLike[]
  modified: PathLike[]
  removed: PathLike[]
}
export interface InputOptions {
  locations: {
    order: string
    mapping: string
    template: string
  }
  order: boolean
  nested: boolean
  branch: string
}