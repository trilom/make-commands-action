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
     * @function getFiles
     */
  describe('...with function getFiles...', () => {
    it('...returns original files if length !== 0..', () =>{
      const files = require('../InputHelper').getFiles('/any/path',['/any/string'])
      expect(files).toBe(files)
    })
    it('...throws error with bad path...', () => {
      const obj = {a: {}}
      obj.a = {b: obj}
      expect(() =>
        require('../InputHelper').getFiles('/bad/path', [])
      ).toThrowError(
        JSON.stringify({
          name: 'getFiles Error',
          error: {}
        })
      )
    })
  })
  /**
     * @function getInputs
     */
  describe('...with function getInputs...', () => {
    it('...sets correct default input parameters.', () => {
      const {
        commands,
        files,
        options,
        location
      } = require('../InputHelper').getInputs()
      const {getInput} = require('@actions/core')
      expect(commands).toStrictEqual({deploy: '', delete: ''})
      expect(files).toStrictEqual({
        all: defFiles,
        added: defFiles,
        modified: defFiles,
        removed: defFiles
      })
      expect(options).toStrictEqual({order: false, nested: true, branch: 'master'})
      expect(location).toStrictEqual({
        order: `${env.envDefault.GITHUB_WORKSPACE}/infrastructure/order`,
        mapping: `${env.envDefault.GITHUB_WORKSPACE}/infrastructure/mappings`,
        template: `${env.envDefault.GITHUB_WORKSPACE}/infrastructure/templates`
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
        const oldEnv = {...env.envStart}
        delete process.env.GITHUB_WORKSPACE
        env = new Env({GITHUB_WORKSPACE: '/workspace'}, p.defInputs)
        env.updateInput({[inputName]: input})
        const {
          commands,
          files,
          options,
          location
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
          order: inputName === 'order' ? expected : false,
          nested: inputName === 'template_nested' ? expected : true,
          branch: inputName === 'branch' ? expected : 'master'
        })
        expect(location).toStrictEqual({
          order:
            inputName === 'order_location'
              ? expected
              : `/workspace/infrastructure/order`,
          mapping:
            inputName === 'mapping_location'
              ? expected
              : `/workspace/infrastructure/mappings`,
          template:
            inputName === 'template_location'
              ? expected
              : `/workspace/infrastructure/templates`
        })
        expect(getInput).toBeCalled()
        process.env = {...oldEnv}
      }
    )
  })
})
