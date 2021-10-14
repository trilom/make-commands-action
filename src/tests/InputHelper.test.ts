import {Env, p, getTestEvents} from './mocks/env'

let env: Env

const defFiles = ['test/test1.yaml', 'test/test2.yaml', 'test2/test1.yaml']

describe('Testing InputHelper.ts with push event...', () => {
  beforeAll(() => {
    env = new Env({}, p.defInputs)
  })
  afterEach(() => {
    process.env = {...env.envStart}
    jest.resetModules()
    env = new Env({}, p.defInputs)
  })
  /**
   * @function getInputs
   */
  describe('...with function getInputs...', () => {
    it('...sets correct default input parameters.', () => {
      const {
        commands,
        files,
        options
      } = require('../InputHelper').getInputs()
      const {getInput} = require('@actions/core')
      expect(commands).toStrictEqual({deploy: '', delete: ''})
      expect(files).toStrictEqual({
        all: defFiles,
        added: defFiles,
        modified: defFiles,
        removed: defFiles
      })
      expect(options).toStrictEqual({
        locations:{
          order: `infrastructure/order`,
          mapping: `infrastructure/mappings`,
          template: `infrastructure/templates`
        },
        order: false,
        nested: true,
        branch: 'master'
      })
      expect(getInput).toBeCalled()
    })
    it('...throws error without file input', () => {
      env.updateInput({files: 'error'})
      const {getInput} = require('@actions/core')
      expect(() => {
        require('../InputHelper').getInputs()
      }).toThrowError()
      expect(getInput).toHaveBeenCalledTimes(3)
    })
    it.each(getTestEvents(p.getInputsInputs, 'push'))(
      '...sets %s input "%s" should be %p',
      (inputName, input, expected) => {
        env.updateInput({[inputName]: input})
        const {
          commands,
          files,
          options
        } = require('../InputHelper').getInputs()
        const {getInput} = require('@actions/core')
        expect(commands).toStrictEqual({
          deploy: inputName === 'deploy' ? expected : '',
          delete: inputName === 'delete' ? expected : ''
        })
        expect(files).toStrictEqual({
          all: inputName === 'files' ? expected : defFiles,
          added: inputName === 'files_added' ? expected : defFiles,
          modified: inputName === 'files_modified' ? expected : defFiles,
          removed: inputName === 'files_removed' ? expected : defFiles
        })
        expect(options).toStrictEqual({
          locations:{
            order:
            inputName === 'order_location'
              ? expected
              : `infrastructure/order`,
            mapping:
            inputName === 'mapping_location'
              ? expected
              : `infrastructure/mappings`,
            template:
            inputName === 'template_location'
              ? expected
              : `infrastructure/templates`
          },
          order: inputName === 'order' ? expected : false,
          nested: inputName === 'template_nested' ? expected : true,
          branch: inputName === 'branch' ? expected : 'master'
        })
        expect(getInput).toBeCalled()
      }
    )
  })
})