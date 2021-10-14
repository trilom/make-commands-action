export interface Command {
  command: string
  waitCommand?: string
}

export interface Commands {
  suffix: any
  prefix: any
  deploy: any
  delete: any
  validate: any
}
