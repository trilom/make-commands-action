import {Env, getTestEvents, p} from './mocks/env'

let env: Env

describe('Testing main.ts...', () => {
  /**
     * @function run
     */
  describe('...with function run...', () => {
    beforeEach(() => {
      env = new Env(
        {},
        {
          ...p.defInputs,
          mock: 'true'
        }
      )
    })
    afterEach(() => {
      process.env = {...env.envStart}
      jest.resetModules()
      jest.unmock('@actions/core')
      jest.unmock('../InputHelper')
    })
    it('...mocked', async () => {
      const inputHelper = require('../InputHelper')
      await expect(require('../main').run()).resolves.toBe(undefined)
      expect(inputHelper).toBeDefined()
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
