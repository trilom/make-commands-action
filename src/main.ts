import {setFailed as coreSetFailed} from '@actions/core'
import {errorMessage} from './UtilsHelper'
import {getInputs} from './InputHelper'

export async function run(): Promise<void> {
  try {
    // get inputs
    const inputs = getInputs()
    // create make commands and store in commands object

    // create a list of products that have changed

    // build the prefix and suffix lifecycle actions

    // create make commands for templates

    // combine all 'changes' arrays into 1 (stacks.json)
  } catch (error) {
    const pError = JSON.parse(error.message)
    coreSetFailed(errorMessage(pError.from, pError))
    throw new Error(JSON.stringify(pError))
  }
}
/* istanbul ignore next */
if (!(process.env.INPUT_MOCK === 'true')) run()
