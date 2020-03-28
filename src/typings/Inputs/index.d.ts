export interface Inputs {
  commands?: {
    deploy?: string
    delete?: string
  }
  files: {
    all: string[]
    added: string[]
    modified: string[]
    removed: string[]
  }
  options: {
    order: boolean
    nested: boolean
    branch: string
  }
  location: {
    order: string
    mapping: string
    template: string
  }
}
