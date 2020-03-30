import {setFailed as coreSetFailed} from '@actions/core'
import {errorMessage} from './UtilsHelper'
import {getInputs} from './InputHelper'
import {getProducts} from './FileHelper'

export async function run(): Promise<void> {
  try {
    // get inputs
    const inputs = getInputs()
    // get products and orders if necessary
    const products = getProducts(inputs.files, inputs.options)
    // turn products object into commands object
    // print/output commands object
  } catch (error) {
    const pError = JSON.parse(error.message)
    coreSetFailed(errorMessage(pError.from, pError))
    throw new Error(JSON.stringify(pError))
  }
}
/* istanbul ignore next */
if (!(process.env.INPUT_MOCK === 'true')) run()
