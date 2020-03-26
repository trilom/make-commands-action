export interface Commands {
  suffix: string[] | {command:string, waitCommand:string | undefined}[] | string[][] | {command:string, waitCommand:string | undefined}[][]
  prefix: string[] | {command:string, waitCommand:string | undefined}[] | string[][] | {command:string, waitCommand:string | undefined}[][]
  deploy: string[] | {command:string, waitCommand:string | undefined}[] | string[][] | {command:string, waitCommand:string | undefined}[][]
  delete: string[] | {command:string, waitCommand:string | undefined}[] | string[][] | {command:string, waitCommand:string | undefined}[][]
  validate: string[]
}
