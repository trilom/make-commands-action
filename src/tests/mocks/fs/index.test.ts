import {mock} from '.'

const fs = mock()

describe('Testing FsMock object...', () => {
  beforeAll(() => jest.restoreAllMocks())
  it('...FsMock is a mock', () => {
    expect(jest.isMockFunction(fs.writeFileSync)).toBe(true)
  })
  it('...FsMock mocks fs', () => {
    const realFs = require('fs')
    expect(fs).toMatchObject(realFs)
  })
  it('...FsMock mocks writeFileSync', () => {
    fs.writeFileSync('a', 'b', 'c')
    expect(fs.writeFileSync).toBeCalledWith('a', 'b', 'c')
  })
  it('...FsMock mocks writeFileSync error', async () => {
    expect(() => fs.writeFileSync('error', 'b', 'c')).toThrowError(
      new Error(JSON.stringify({name: 'PathError', status: '500'}))
    )
  })
  it('...FsMock mocks readFile', () => {
    fs.readFile('/order/', 'b', (err,data) => {
      expect(data).toBe('YAML')
    })
    fs.readFile('/path/files_modified.json', 'b', (err,data) => {
      expect(data).toBe(
        '["test/test1.yaml","test/test2.yaml","test2/test1.yaml"]'
      )
    })
    fs.readFile('/path/files_added.json', 'b', (err,data) => {
      expect(data).toBe(
        '["test/test1.yaml","test/test2.yaml","test2/test1.yaml"]'
      )
    })
    fs.readFile('/path/files_removed.json', 'b', (err,data) => {
      expect(data).toBe(
        '["test/test1.yaml","test/test2.yaml","test2/test1.yaml"]'
      )
    })
    fs.readFile('/path/files.json', 'b', (err,data) => {
      expect(data).toBe(
        '["test/test1.yaml","test/test2.yaml","test2/test1.yaml"]'
      )
    })
  })
  it('...FsMock mocks readFile path error', async () => {
    expect(() => fs.readFile('/error/', 'utf8', (e) => {
      expect(e).toBe('error')
    })).toThrowError(
      new Error(JSON.stringify({name: 'PathError', status: '500'}))
    )
  })
  it('...FsMock mocks readFileSync', async () => {
    let file = fs.readFileSync('/order/', 'b')
    expect(file).toBe('YAML')
    file = fs.readFileSync('/path/files_modified.json', 'b')
    expect(file).toBe(
      '["test/test1.yaml","test/test2.yaml","test2/test1.yaml"]'
    )
    file = fs.readFileSync('/path/files_added.json', 'b')
    expect(file).toBe(
      '["test/test1.yaml","test/test2.yaml","test2/test1.yaml"]'
    )
    file = fs.readFileSync('/path/files_removed.json', 'b')
    expect(file).toBe(
      '["test/test1.yaml","test/test2.yaml","test2/test1.yaml"]'
    )
    file = fs.readFileSync('/path/files.json', 'b')
    expect(file).toBe(
      '["test/test1.yaml","test/test2.yaml","test2/test1.yaml"]'
    )
    file = fs.readFileSync('/path/files', 'b')
    expect(file).toBe('')
  })
  it('...FsMock mocks readFileSync path error', async () => {
    expect(() => fs.readFileSync('error', 'b')).toThrowError(
      new Error(JSON.stringify({name: 'PathError', status: '500'}))
    )
  })
  it('...FsMock mocks readdirSync', async () => {
    let file = fs.readdirSync('/order/')
    expect(file.length).toBe(2)
    expect(file[0]).toStrictEqual(expect.stringContaining('order.yaml'))
    expect(file[1]).toStrictEqual(expect.stringContaining('order2.yaml'))
    file = fs.readdirSync('/templates/')
    expect(file.length).toBe(2)
    expect(file[0]).toStrictEqual(expect.stringContaining('template.yaml'))
    expect(file[1]).toStrictEqual(expect.stringContaining('template2.yaml'))
    file = fs.readdirSync('/anything/')
    expect(file.length).toBe(2)
    expect(file[0]).toStrictEqual(expect.stringContaining('file.yaml'))
    expect(file[1]).toStrictEqual(expect.stringContaining('file2.yaml'))
  })
  it('...FsMock mocks readdirSync error', async () => {
    expect(() => fs.readdirSync('error')).toThrowError(
      new Error(JSON.stringify({name: 'PathError', status: '500'}))
    )
  })
  it('...FsMock mocks existsSync', async () => {
    let exist = fs.existsSync('/any/')
    expect(exist).toBe(true)
    exist = fs.existsSync('/false/')
    expect(exist).toBe(false)
  })
  it('...FsMock mocks existsSync error', async () => {
    expect(() => fs.existsSync('/error/')).toThrowError(
      new Error(JSON.stringify({name: 'PathError', status: '500'}))
    )
  })
  it('...FsMock mocks exists', async () => {
    fs.exists('/any/', (e) => {
      expect(e).toBe(true)
    })
    fs.exists('/false/', (e) => {
      expect(e).toBe(false)
    })
    fs.exists('/existTest.yaml', (e) => {
      expect(e).toBe(false)
    })
  })
  it('...FsMock mocks callback error', async () => {
    expect(() => fs.exists('/error/', (e) => {
      expect(e).toBe('/error/')
    })).toThrowError(
      new Error(JSON.stringify({name: 'PathError', status: '500'}))
    )
  })
})