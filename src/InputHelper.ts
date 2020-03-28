import {getInput as coreGetInput} from '@actions/core'
import {readFileSync} from 'fs'
import {resolve} from 'path'
import {Inputs} from 'typings/Inputs'
import {getErrorString} from './UtilsHelper'

/**
 * @function getFiles
 * @param path path to get files for
 * @param files original files array, will return this if length !== 0
 * @returns {string[]} files to use either read from FS or from input
 */
export function getFiles(path:string, files: string[]): string[] {
  try {
    if (files.length === 0) return JSON.parse(readFileSync(resolve(path), 'utf8'))
    return files
  } catch (error) {
    throw new Error(JSON.stringify({ name: 'getFiles Error', error }))
  }
}

/**
 * @function getInputs
 * @description reads the inputs to the action with core.getInput and returns object
 * @returns {Inputs} object of inputs for the github action
 */
export function getInputs(): Inputs {
  const input = {} as Inputs
  try {
    const home = process.env.HOME
    const workspace = process.env.GITHUB_WORKSPACE
    input.commands = {
      deploy: coreGetInput('deploy'),
      delete: coreGetInput('delete')}
    input.files = Object.fromEntries([
      ['all', getFiles(`${home}/files.json`, JSON.parse(coreGetInput('files')))],
      ['added', getFiles(`${home}/files_added.json`, JSON.parse(coreGetInput('files_added')))], 
      ['modified', getFiles(`${home}/files_modified.json`, JSON.parse(coreGetInput('files_modified')))], 
      ['removed', getFiles(`${home}/files_removed.json`, JSON.parse(coreGetInput('files_removed')))]]) as any
    input.options = {
      order: coreGetInput('order') === 'true' || false,
      nested: coreGetInput('template_nested') === 'true' || false,
      branch: coreGetInput('branch').includes('refs/pull')
        ? 'default'
        : coreGetInput('branch').replace('refs/heads/', '')
    }
    input.location = {
      order: resolve(`${workspace}/${coreGetInput('order_location')}`),
      mapping: resolve(`${workspace}/${coreGetInput('mapping_location')}`),
      template: resolve(`${workspace}/${coreGetInput('template_location')}`)}
    return input as Inputs
  } catch (error) {
    const eString = `Received an issue getting action inputs.`
    const retVars = Object.fromEntries(
      Object.entries(process.env).filter(
        key =>
          key[0].includes('GITHUB') ||
          key[0].includes('INPUT_') ||
          key[0] === 'HOME'
      )
    )
    throw new Error(
      getErrorString('getInputs Error', 500, getInputs.name, eString, {input, env: retVars, error:JSON.stringify(error)})
    )
  }
}
