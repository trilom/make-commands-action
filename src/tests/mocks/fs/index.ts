import {FsMock} from 'typings/FsMock'

const fsMock = {
  writeFileSync: jest.fn((path, data, options) => {
    if (path === 'error')
      throw new Error(JSON.stringify({name: 'PathError', status: '500'}))
    // console.log(`fs.writeFileSync triggered with path: ${path} data: ${data} options: ${options}`)
  }),
  readFileSync: jest.fn((path, options ) => {
    let file = ''
    if (path.includes('order'))
      file = 'YAML' // return order file
    if (
      path.includes(`files_added.json`) ||
      path.includes(`files_modified.json`) ||
      path.includes(`files_removed.json`) ||
      path.includes('files.json')
    )
      file = JSON.stringify(['test/test1.yaml','test/test2.yaml', 'test2/test1.yaml']) // return array of files
    if (path.includes(`error`))
      throw new Error(JSON.stringify({name: 'PathError', status: '500'}))
    return file
  }),
  readdirSync: jest.fn((path) => {
    let dir = []
    if (path.includes('order'))
      dir = ['/order/order.yaml', '/order/order2.yaml'] // return list of order files
    else if (path.includes('templates'))
      dir = ['/templates/template.yaml', '/templates/template2.yaml'] // return list of template files
    else if (path.includes(`error`))
      throw new Error(JSON.stringify({name: 'PathError', status: '500'}))
    else dir = ['/file.yaml', '/file2.yaml']
    return dir
  }),
  existsSync: jest.fn((path) => {
    if (path.includes(`false`))
      return false
    if (path.includes(`error`))
      throw new Error(JSON.stringify({name: 'PathError', status: '500'}))
    return true
  })
}

export function mock(): FsMock {
  jest.mock('fs', () => fsMock)
  return fsMock
}
