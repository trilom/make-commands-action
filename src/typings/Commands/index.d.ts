interface Command {
  command: string
  waitCommand?: string
}
export interface Commands {
  suffix: (string | Command)[] | (string | Command)[][]
  prefix: (string | Command)[] | (string | Command)[][]
  deploy: (string | Command)[] | (string | Command)[][]
  delete: (string | Command)[] | (string | Command)[][]
  validate: string[]
}
