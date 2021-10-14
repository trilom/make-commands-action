import {Env, getTestEvents, p} from './mocks/env'

let env: Env

describe('Testing main.ts...', () => {
  /**
   * @function run
   */
  describe('...with function run...', () => {
    describe.each(p.orderInputs)('...with order %s...', (orderInput, orderExpected) => {
      describe.each(p.commandInputs)('...with command %s...', (commandInput, commandExpected) => {
        describe.each(p.branchInputs)('...with branch %s...', (branchInput, branchExpected) => {
          describe.each(p.templateNestedInputs)('...with nestedTemplates %s...', (nestedInput, nestedExpected) => {
            beforeEach(() => {
              env = new Env(
                {},
                {
                  ...p.defInputs,
                  template_location: '/path/test',
                  mapping_location: `/.github/actions/integration/workspace/simple/mappings/simple.yaml`,
                  order_location: `/.github/actions/integration/workspace/simple/order/simple.yaml`,
                  order: 'true',
                  template_nested: 'true',
                  files: JSON.stringify(['/path/test/test1.yaml', '/path/test/test2.yaml', '/path/test/test3.yaml', '/path/test/test4.yaml']),
                  files_added: JSON.stringify(['/path/test/test1.yaml', '/path/test/test2.yaml', '/path/test/test3.yaml']),
                  files_modified: JSON.stringify(['/path/test/test1.yaml', '/path/test/test2.yaml', '/path/test/test3.yaml']),
                  files_removed: JSON.stringify(['/path/test/test3.yaml']),
                  mock: 'true'
                }
              )
            })
            afterEach(() => {
              process.env = {...env.envStart}
              jest.resetModules()
              jest.unmock('@actions/core')
              jest.unmock('../InputHelper')
              jest.unmock('../FilesHelper')
            })
            it('...mocked...', async () => {
            // const readFileSync = jest.requireActual('fs')
              const inputHelper = require('../InputHelper')
              const filesHelper = require('../FilesHelper')
              await expect(require('../main').run()).resolves.toBe(undefined)
              expect(inputHelper).toBeDefined()
              expect(filesHelper).toBeDefined()
            })
            it.each(getTestEvents(p.mainErrorInputs, 'push'))(
              '...throws error for mocked function %s...',
              async (f, e, expected) => {
                const inputHelper = require('../InputHelper')
                inputHelper.getInputs = jest.fn(() => {
                  throw new Error(e)
                })
                await expect(require('../main').run()).rejects.toThrowError(
                  new Error(
                    JSON.stringify({
                      name: 'Error',
                      message: 'Error',
                      from: f
                    })
                  )
                )
                expect(inputHelper.getInputs).toHaveBeenCalledTimes(1)
              }
            )
          })
        })
      })
    })
  })
})
