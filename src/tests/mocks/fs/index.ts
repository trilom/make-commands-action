import {FsMock} from 'typings/FsMock'

// const {readFile} = jest.requireActual('fs')

const fsMock = {
  writeFileSync: jest.fn((path, data, options) => {
    if (path === 'error')
      throw new Error(JSON.stringify({name: 'PathError', status: '500'}))
    // console.log(`fs.writeFileSync triggered with path: ${path} data: ${data} options: ${options}`)
  }),
  readFileSync: jest.fn((path, options) => {
    return readFile(path)
  }),
  readFile: jest.fn((path, options, callback) =>  {
    if (path.includes('error')) callback('error', '')
    callback('', readFile(path))
  }),
  readdirSync: jest.fn(path => {
    let dir = []
    if (path.includes('order'))
      dir = ['/order/order.yaml', '/order/order2.yaml']
    // return list of order files
    else if (path.includes('templates'))
      dir = ['/templates/template.yaml', '/templates/template2.yaml']
    // return list of template files
    else if (path.includes(`error`))
      throw new Error(JSON.stringify({name: 'PathError', status: '500'}))
    else dir = ['/file.yaml', '/file2.yaml']
    return dir
  }),
  existsSync: jest.fn(path => {
    return exists(path)
  }),
  exists: jest.fn((path, callback) => callback(exists(path)))
}

export function mock(): FsMock {
  jest.mock('fs', () => fsMock)
  return fsMock
}

function exists(path:string):boolean {
  if (path.includes(`false`)) return false
  if (path.includes(`existTest.yaml`)) return false
  if (path.includes(`error`))
    throw new Error(JSON.stringify({name: 'PathError', status: '500'}))
  return true
}

function readFile(path:string):string {
  let file = ''
  if (path.includes('order')) file = 'YAML' // return order file
  if (
    path.includes(`files_added.json`) ||
    path.includes(`files_modified.json`) ||
    path.includes(`files_removed.json`) ||
    path.includes('files.json')
  )
    file = JSON.stringify([
      'test/test1.yaml',
      'test/test2.yaml',
      'test2/test1.yaml'
    ]) // return array of files
  if (path.includes(`${process.env.GITHUB_WORKSPACE}`))
    file = jest.requireActual('fs').readFileSync(path, 'utf8')
  if (path.includes('undefined'))
    throw new Error(JSON.stringify({name: 'UndefinedError', status: '500'}))
  if (path.includes(`error`))
    throw new Error(JSON.stringify({name: 'PathError', status: '500'}))
  return file
}