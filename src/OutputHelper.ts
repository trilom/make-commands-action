import {InputCommands} from 'typings/Inputs'
import {Products, Product} from 'typings/Products'
import {Commands, Command} from 'typings/Commands'
import {getOrder} from './FilesHelper'

/**
 * @function makeCommand
 * @description pass in role, make a command string
 * @param {string} inputCommand
 * @param {}
 */
export function makeCommand(commandString:string, role:string):string {
  const cmd = commandString
  // need to know which command string to use
  if (cmd.includes('{{WORKSPACE}}')) cmd.replace('{{WORKSPACE}}', process.env.GITHUB_WORKSPACE || '') // path to workspace
  if (cmd.includes('{{PATH}}')) cmd.replace('{{PATH}}', `${process.env.GITHUB_WORKSPACE}`) // path to template
  if (cmd.includes('{{FULLPATH}}')) cmd.replace('{{FULLPATH}}', '') // fullpath to template
  if (cmd.includes('{{FILE}}')) cmd.replace('{{FILE}}', '') // name of template file without ext
  if (cmd.includes('{{BRANCH}}')) cmd.replace('{{BRANCH}}', '') // branch ran on
  if (cmd.includes('{{PRODUCT}}')) cmd.replace('{{PRODUCT}}', '') // product name
  if (cmd.includes('{{ROLE}}')) cmd.replace('{{ROLE}}', role) // role name
  return ''
}
/**
 * @function orderCommands
 * @description pass in command information, return sorted
 * @param {string} inputCommand
 * @param {}
 */
export function orderCommands(product:Product, commands:Commands):Commands {

  return {} as Commands
}

export function getCommands(products:Products, order:boolean, input:InputCommands):Commands {
  const orderActions = order ? ['deploy', 'delete', 'prefix', 'suffix', 'validate'] : ['deploy', 'delete']
  const commands = {} as Commands
  Object.keys(products).forEach(key => { // for each product (products[key])
    orderActions.forEach(action=> { // for each action (action)
      if (action === 'deploy' || action === 'delete' ) { // no order or order
        const actions = commands[action]
        if (!Object.keys(commands).includes(action)) { // action undefined
          commands[action] = [...products[key][action]]
        } else { // action defined
          products[key][action].forEach((cmd, i) => { // for each command in products[key][action]
            if (actions.length-1 >= i) { // current length-1 >= incoming length
              if (Array.isArray(actions[i]) && !actions[i].includes(cmd)) { // current[i] is array and cmd doesnt exist
                actions[i] = actions[i].concat(cmd)
              } else if (typeof actions[i] === 'string' && actions[i] !== cmd) {
                actions[i] = [actions[i], cmd]
              }
            } else {
              actions.push(cmd)
            }
          })
          // after mapping added deploy/delete commands
        }
      } else if (action === 'validate' || action === 'prefix'|| action === 'suffix' ) { // order file
        // deal with prefix/suffix/validate
        const current = commands[action]
      }
    })
  })
  return commands
}