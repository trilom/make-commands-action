import {CoreMock} from 'typings/CoreMock'
import {FsMock} from 'typings/FsMock'
import {resolve as _resolve} from 'path'
import {mock as mockCore} from '../core'
import {mock as mockFs} from '../fs'
import * as envPayloads from '../../payloads'

// export payloads and class
export {envPayloads as p}

export function formatInput(inputs: {
  [key: string]: string
}): {[key: string]: string} {
  return Object.fromEntries(
    Object.entries(inputs).map(input => {
      const t = [
        input[0].replace(
          input[0],
          `INPUT_${input[0].replace(/ /g, '_').toUpperCase()}`
        ),
        input[1]
      ]
      return t
    })
  )
}

export function getTestEvents(inputs: any, event: string): any[][] {
  const ret: any[][] = []
  inputs.forEach((test: any) => {
    if (typeof test.events === 'string' && test.events === 'all')
      ret.push(test.inputs)
    // add for all events
    else if (typeof test.events === 'string' && test.events === event)
      ret.push(test.inputs)
    // add for named event
    else if (Array.isArray(test.events) && test.events.includes(event))
      ret.push(test.inputs) // add for named event in list
  })
  return ret
}

export class Env {
  public envDefault: {[key: string]: string} = {
    GITHUB_TOKEN: 'EnvDefaultToken',
    GITHUB_WORKSPACE: _resolve(__dirname, '../../workspace/github'),
    GITHUB_REPOSITORY: 'trilom/make-commands-action',
    GITHUB_ACTION: 'make-commands-action'
  }

  public envStart: {[key: string]: string | undefined} = {...process.env} // store shallow copy of process.env on init

  // set mocks
  coreMock: CoreMock = {} as CoreMock

  fsMock: FsMock = {} as FsMock

  constructor(
    envVars: {[key: string]: string}, // any additional env vars on top of process.env
    inputs: {[key: string]: string},
    mock = true
  ) {
    this.setEnv(envVars, inputs) // set env vars with event input
    if (mock) {
      this.coreMock = mockCore() // mock core
      this.fsMock = mockFs() // mock fs
    }
  }

  setEnv(
    envVars: {[key: string]: string},
    inputs: {[key: string]: string}
  ): void {
    this.setInput({
      ...this.envDefault, // add default vars
      ...{
        GITHUB_EVENT_PATH: '/fake/path',
        GITHUB_EVENT_NAME: 'push'
      }, // add event payload passed in
      ...envVars,
      ...formatInput(inputs) // add in passed in vars
    })
  }

  setInput(inputs: {[key: string]: string}): void {
    process.env = {...this.envStart, ...inputs}
  }

  updateInput(inputs: {[key: string]: string}): void {
    process.env = {...process.env, ...formatInput(inputs)}
  }
}
