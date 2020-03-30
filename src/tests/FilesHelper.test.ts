import {Env, p, getTestEvents} from './mocks/env'

let env: Env

describe('Testing FilesHelper.ts with push event...', () => {
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
      const files = require('../FilesHelper').getFiles('/any/path', [
        '/any/string'
      ])
      expect(files).toBe(files)
    })
    it('...throws error with bad path...', () => {
      expect(() =>
        require('../FilesHelper').getFiles('/bad/error', [])
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
      let role = require('../FilesHelper').parseTemplate('/path/test/one.yaml', true)
      expect(role).toStrictEqual({ product: 'test', name: 'one' })
      role = require('../FilesHelper').parseTemplate('/path/test/test2-two.yaml', false)
      expect(role).toStrictEqual({ product: 'test2', name: 'two' })
    })
    it('...throws error with bad template...', () => {
      expect(() =>
        require('../FilesHelper').parseTemplate(
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
          mapping: '/path/mapping',
          order: `/.github/actions/integration/workspace/simple/order/simple.yaml`
        },
        order: false,
        nested: true
      }
      let products = require('../FilesHelper').getProducts(files, options)
      expect(products).toStrictEqual({ 
        test: {
          name: 'test',
          order: false,
          mapping: {
            path: '/path/mapping/test.yaml',
            changed: false
          },
          deploy: ['test1', 'test2', 'test3'],
          delete: ['test3']
        }})
      files.added.push('/path/mapping/test.yml')
      products = require('../FilesHelper').getProducts(files, options)
      expect(products).toStrictEqual({ 
        test: {
          name: 'test',
          order: false,
          mapping: {
            path: '/path/mapping/test.yml',
            changed: true
          },
          deploy: ['test1', 'test2', 'test3'],
          delete: ['test3']
        }})
      files.modified.push('/path/mapping/test.yaml')
      products = require('../FilesHelper').getProducts(files, options)
      expect(products).toStrictEqual({ 
        test: {
          name: 'test',
          order: false,
          mapping: {
            path: '/path/mapping/test.yaml',
            changed: true
          },
          deploy: ['test1', 'test2', 'test3'],
          delete: ['test3']
        }})
      products = require('../FilesHelper').getProducts({added:['/path/mapping/test.yml']}, options)
      expect(products).toStrictEqual({ 
        test: {
          name: 'test',
          order: false,
          mapping: {
            path: '/path/mapping/test.yml',
            changed: true
          }
        }})
      options.order = true
      products = require('../FilesHelper').getProducts(files, options)
      expect(products).toStrictEqual({ 
        test: {
          name: 'test',
          order: {
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
          },
          mapping: {
            path: '/path/mapping/test.yaml',
            changed: true
          },
          deploy: ['test1', 'test2', 'test3'],
          delete: ['test3']
        }})
      const files2 = {
        all: [...files.all, '/path/test2/test1.yaml', '/path/test2/test2.yaml', '/path/test2/test3.yaml', '/path/test2/test4.yaml'],
        added: [...files.added, '/path/test2/test1.yaml', '/path/test2/test2.yaml', '/path/test2/test3.yaml'],
        modified: [...files.modified, '/path/test2/test1.yaml', '/path/test2/test2.yaml', '/path/test2/test3.yaml'],
        removed: [...files.removed, '/path/test2/test3.yaml']
      }
      products = require('../FilesHelper').getProducts(files2, options)
      expect(products).toStrictEqual({ 
        test: {
          name: 'test',
          order: {
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
          },
          mapping: {
            path: '/path/mapping/test.yaml',
            changed: true
          },
          deploy: ['test1', 'test2', 'test3'],
          delete: ['test3']
        },
        test2: {
          name: 'test2',
          order: {
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
          },
          mapping: {
            path: '/path/mapping/test2.yaml',
            changed: false
          },
          deploy: ['test1', 'test2', 'test3'],
          delete: ['test3']
        }
      })
    })
  })
  /**
   * @function getOrder
   */
  describe('...with function getOrder...', () => {
    it('...works as expected...', () => {
      const order = require('../FilesHelper').getOrder(`/.github/actions/integration/workspace/simple/order/simple.yaml`)
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
        require('../FilesHelper').getOrder('/path/test/error.yaml')
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
        require('../FilesHelper').getOrder('/path/test/undefined.yaml')
      ).toThrowError(
        JSON.stringify({
          name: 'getOrder Error',
          message: 'undefined order',
          path: '/path/test/undefined.yaml',
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
      let exist = require('../FilesHelper').existFile('/path/test/one.yaml')
      expect(exist).toBe(true)
      exist = require('../FilesHelper').existFile('/path/test/false.yaml')
      expect(exist).toBe(false)
      let file = require('../FilesHelper').existFile('/path/test/one', true, true)
      expect(file).toBe('/path/test/one.yaml')
      file = require('../FilesHelper').existFile('/path/test/existTest', true, true)
      expect(file).toBe('/path/test/existTest.yml')
      file = require('../FilesHelper').existFile('/path/test/one.yaml', false, true) 
      expect(file).toBe('/path/test/one.yaml')
      exist = require('../FilesHelper').existFile('/path/test/one', true) 
      expect(exist).toBe(true)
    })
  })
})