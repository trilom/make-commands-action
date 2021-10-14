import {Env, p, getTestEvents} from './mocks/env'

const test1 = {
  name: 'test1',
  order: {
    path: '/.github/actions/integration/workspace/simple/order/test1.yaml'
  },
  deploy: ['test1'],
  delete: ['test1']
}

const test2 = {
  name: 'test2',
  order: {
    path: '/.github/actions/integration/workspace/simple/order/test2.yaml'
  },
  deploy: ['test2', 'test3'],
  delete: ['test2']
}

const test3 = {
  name: 'test3',
  order: {
    path: '/.github/actions/integration/workspace/simple/order/test3.yaml'
  },
  deploy: ['test4', 'test5', 'test6'],
  delete: ['test4']
}

const test4 = {
  name: 'test4',
  order: {
    path: '/.github/actions/integration/workspace/simple/order/test4.yaml'
  },
  deploy: ['test7', 'test8', 'test9', 'test10'],
  delete: ['test7']
}

const test5 = {
  name: 'test5',
  order: {
    path: '/.github/actions/integration/workspace/simple/order/test5.yaml'
  },
  deploy: ['test11', 'test12', 'test13', 'test14', 'test15'],
  delete: ['test11', 'test12']
}

let env: Env
describe('Testing OutputHelper.ts with push event...', () => {
  beforeAll(() => {
    env = new Env({}, {})
  })
  afterEach(() => {
    process.env = {...env.envStart}
    jest.resetModules()
    env = new Env({}, {})
  })
  /**
   * @function getCommands
   */
  describe('...with function getCommands...', () => {
    it('...one (no order)...', () => {
      const commands = require('../OutputHelper').getCommands({test1}, false, {})
      expect(commands).toStrictEqual({
        delete: [
          'test1',
        ],
        deploy: [
          'test1',
        ],
      })
    })
    it('...two same array (no order)...', () => {
      const commands = require('../OutputHelper').getCommands({test3, test2:test3}, false, {})
      expect(commands).toStrictEqual({
        delete: ['test4'],
        deploy: ['test4', 'test5', 'test6']
      })
    })
    it('...two small > big array (no order)...', () => {
      const commands = require('../OutputHelper').getCommands({test2, test4}, false, {})
      expect(commands).toStrictEqual({
        delete: [['test2', 'test7']],
        deploy: [
          ['test2', 'test7'],
          ['test3', 'test8'],
          'test9',
          'test10'
        ]
      })
    })
    it('...two big > small array (no order)...', () => {
      const commands = require('../OutputHelper').getCommands({test4, test2}, false, {})
      expect(commands).toStrictEqual({
        delete: [['test7', 'test2']],
        deploy: [
          ['test7', 'test2'],
          ['test8', 'test3'],
          'test9',
          'test10'
        ]
      })
    })
    it('...three small > big array (no order)...', () => {
      const commands = require('../OutputHelper').getCommands({test1, test3, test5}, false, {})
      expect(commands).toStrictEqual({
        delete: [
          ['test1', 'test4', 'test11'],
          'test12'
        ],
        deploy: [
          ['test1', 'test4', 'test11'],
          ['test5', 'test12'],
          ['test6', 'test13'],
          'test14',
          'test15'
        ]
      })
    })
    it('...three big > small array (no order)...', () => {
      const commands = require('../OutputHelper').getCommands({test5, test3, test1}, false, {})
      expect(commands).toStrictEqual({
        delete: [
          ['test11', 'test4', 'test1'],
          'test12'
        ],
        deploy: [
          ['test11', 'test4', 'test1'],
          ['test12', 'test5'],
          ['test13', 'test6'],
          'test14',
          'test15'
        ]
      })
    })
    it('...three medium > small > big array (no order)...', () => {
      const commands = require('../OutputHelper').getCommands({test3, test1, test5}, false, {})
      expect(commands).toStrictEqual(
        {
          delete: [
            ['test4', 'test1', 'test11'],
            'test12'
          ],
          deploy: [
            ['test4', 'test1', 'test11'],
            ['test5', 'test12'],
            ['test6', 'test13'],
            'test14',
            'test15'
          ]
        }
      )
    })
    it('...five array (no order)...', () => {
      const commands = require('../OutputHelper').getCommands({test1, test2, test3, test4, test5}, false, {})
      expect(commands).toStrictEqual(
        {
          delete: [
            ['test1', 'test2', 'test4', 'test7', 'test11'],
            'test12'
          ],
          deploy: [
            ['test1', 'test2', 'test4', 'test7', 'test11'],
            ['test3', 'test5', 'test8', 'test12'],
            ['test6', 'test9', 'test13'],
            ['test10', 'test14'],
            'test15'
          ]
        }
      )
    })
  })
})
