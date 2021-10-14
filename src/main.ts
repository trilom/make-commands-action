import {setFailed as coreSetFailed} from '@actions/core'
import {Commands} from 'typings/Commands'
import {errorMessage} from './UtilsHelper'
import {getInputs} from './InputHelper'
import {getProducts} from './FilesHelper'
import {getCommands} from './OutputHelper'

export async function run(): Promise<void> {
  try {
    // get inputs
    const inputs = getInputs()
    // get products and orders if necessary
    const products = getProducts(inputs.files, inputs.options)
    // turn products object into commands object
    let commands = {} as Commands
    if (!inputs.options.order) 
      commands = getCommands(products)
    console.log(commands)
    // get delete/deploy for each product

    // parseCommands(roles, order)
    
    // print/output commands object
  } catch (error) {
    const pError = JSON.parse(error.message)
    coreSetFailed(errorMessage(pError.from, pError))
    throw new Error(JSON.stringify(pError))
  }
}
/* istanbul ignore next */
if (!(process.env.INPUT_MOCK === 'true')) run()
