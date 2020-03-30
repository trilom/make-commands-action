import {Env, p, getTestEvents} from './mocks/env'

let env: Env

describe('Testing FileHelper.ts with push event...', () => {
  beforeAll(() => {
    env = new Env({}, p.defInputs)
  })
  afterEach(() => {
    process.env = {...env.envStart}
    jest.resetModules()
    env = new Env({}, p.defInputs)
  })
  /**
   * @function getFiles
   */
  describe('...with function getFiles...', () => {
    it('...works as expected...', () => {
      const files = require('../FileHelper').getFiles('/any/path', [
        '/any/string'
      ])
      expect(files).toBe(files)
    })
    it('...throws error with bad path...', () => {
      expect(() =>
        require('../FileHelper').getFiles('/bad/error', [])
      ).toThrowError(
        JSON.stringify({
          name: 'getFiles Error',
          error: 'error',
          path: '/bad/error',
          file: ''
        })
      )
    })
  })
  /**
   * @function parseTemplate
   */
  describe('...with function parseTemplate...', () => {
    it('...works as expected...', () => {
      let role = require('../FileHelper').parseTemplate('/path/test/one.yaml', true)
      expect(role).toStrictEqual({ product: 'test', name: 'one' })
      role = require('../FileHelper').parseTemplate('/path/test/test2-two.yaml', false)
      expect(role).toStrictEqual({ product: 'test2', name: 'two' })
    })
    it('...throws error with bad template...', () => {
      expect(() =>
        require('../FileHelper').parseTemplate(
          '/path/test/test2two.yaml',
          false
        )
      ).toThrowError(
        JSON.stringify({
          name: 'parseTemplate Error',
          error: {
            path:'/path/test/test2two.yaml',
            nested: false
          }
        })
      )
    })
  })
  /**
   * @function getProducts
   */
  describe('...with function getProducts...', () => {
    it('...works as expected...', () => {
      const files = {
        all: ['/path/test/test1.yaml', '/path/test/test2.yaml', '/path/test/test3.yaml', '/path/test/test4.yaml'],
        added: ['/path/test/test1.yaml', '/path/test/test2.yaml', '/path/test/test3.yaml'],
        modified: ['/path/test/test1.yaml', '/path/test/test2.yaml', '/path/test/test3.yaml'],
        removed: ['/path/test/test3.yaml']
      }
      const options = {
        locations: {
          template: '/path/test',
          mapping: '/path/mapping'
        },
        nested: true
      }
      let products = require('../FileHelper').getProducts(files, options)
      expect(products).toStrictEqual({ 
        test: {
          name: 'test',
          mapping: {
            path: '/path/mapping/test.yaml',
            changed: false
          },
          deploy: ['test1', 'test2', 'test3'],
          delete: ['test3']
        }})
      files.added.push('/path/mapping/test.yml')
      products = require('../FileHelper').getProducts(files, options)
      expect(products).toStrictEqual({ 
        test: {
          name: 'test',
          mapping: {
            path: '/path/mapping/test.yml',
            changed: true
          },
          deploy: ['test1', 'test2', 'test3'],
          delete: ['test3']
        }})
      files.modified.push('/path/mapping/test.yaml')
      products = require('../FileHelper').getProducts(files, options)
      expect(products).toStrictEqual({ 
        test: {
          name: 'test',
          mapping: {
            path: '/path/mapping/test.yaml',
            changed: true
          },
          deploy: ['test1', 'test2', 'test3'],
          delete: ['test3']
        }})
      products = require('../FileHelper').getProducts({added:['/path/mapping/test.yml']}, options)
      expect(products).toStrictEqual({ 
        test: {
          name: 'test',
          mapping: {
            path: '/path/mapping/test.yml',
            changed: true
          }
        }})
    })
  })
  /**
   * @function getOrder
   */
  describe('...with function getOrder...', () => {
    it('...works as expected...', () => {
      const order = require('../FileHelper').getOrder(`${process.env.GITHUB_WORKSPACE}/.github/actions/integration/workspace/simple/order/simple.yaml`)
      expect(order).toStrictEqual({
        commands: {
          delete: 'simple',
          deploy: 'simple'
        },
        deploy: {
          develop: ['email'],
          master: [
            'database',
            'email',
            [
              'web',
              'sso'
            ]
          ]
        }
      })
    })
    it('...throws error from readFile order file...', () => {
      expect(() =>
        require('../FileHelper').getOrder('/path/test/error.yaml')
      ).toThrowError(
        JSON.stringify({
          name: 'getOrder readFile Error',
          error: 'error',
          path: '/path/test/error.yaml',
          file: ''
        })
      )
    })
    it('...throws error from safeLoad order file...', () => {
      expect(() =>
        require('../FileHelper').getOrder('/path/test/one.yaml')
      ).toThrowError(
        JSON.stringify({
          name: 'getOrder Error',
          message: 'undefined order',
          path: '/path/test/one.yaml',
          file: ''
        })
      )
    })
  })
  /**
   * @function existFile
   */
  describe('...with function existFile...', () => {
    it('...works as expected...', () => {
      let exist = require('../FileHelper').existFile('/path/test/one.yaml')
      expect(exist).toBe(true)
      exist = require('../FileHelper').existFile('/path/test/false.yaml')
      expect(exist).toBe(false)
      let file = require('../FileHelper').existFile('/path/test/one', true, true)
      expect(file).toBe('/path/test/one.yaml')
      file = require('../FileHelper').existFile('/path/test/existTest', true, true)
      expect(file).toBe('/path/test/existTest.yml')
      file = require('../FileHelper').existFile('/path/test/one.yaml', false, true) 
      expect(file).toBe('/path/test/one.yaml')
      exist = require('../FileHelper').existFile('/path/test/one', true) 
      expect(exist).toBe(true)
    })
  })
})