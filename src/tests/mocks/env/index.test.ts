import {Env, formatInput, getTestEvents} from '.'

let env: Env

describe('Testing Env object with push event...', () => {
  beforeAll(() => {
    env = new Env({}, {})
  })
  it('...Env sets push as default event', () => {
    env = new Env({}, {})
    expect(process.env.GITHUB_EVENT_NAME).toBe('push')
  })
  it('...Env can format strings for action process.env.INPUT_INPUTNAME', () => {
    const event = 'push'
    const input = {test: 'value', REALtest: 'realVALUE', [event]: event}
    const result = formatInput(input)
    expect(result).toStrictEqual({
      INPUT_TEST: 'value',
      INPUT_REALTEST: 'realVALUE',
      [`INPUT_${event.replace(/ /g, '_').toUpperCase()}`]: event
    })
  })
  it('...Env can get correct test event inputs', () => {
    const event = 'all'
    const initClientTestInputs = [
      {inputs: ['test include all'], events: 'all'},
      {inputs: ['test exclude string'], events: 'tall'},
      {inputs: ['test include string'], events: event},
      {inputs: ['test include array'], events: [event, 'tall']},
      {inputs: ['test exclude array'], events: ['handsome', 'dark', 'tall']}
    ]
    let result = getTestEvents(initClientTestInputs, 'all')
    expect(result.length).toBe(3)
    result = getTestEvents(initClientTestInputs, 'tall')
    expect(result.length).toBe(5)
  })
  it('...Env can updateInput for action in process.env.INPUT_INPUTNAME without a new object', () => {
    env = new Env({}, {test_input: 'test_value'})
    expect(process.env.INPUT_TEST_INPUT).toEqual('test_value')
    env.updateInput({test_input: 'new_value'})
    expect(process.env.INPUT_TEST_INPUT).toEqual('new_value')
    delete process.env.INPUT_TEST_INPUT
  })
  it('...Env can return an unmocked environment', () => {
    const tenv = new Env({}, {}, false)
    expect(tenv.coreMock).toMatchObject({})
    expect(tenv.coreMock).not.toMatchObject(env.coreMock)
    expect(tenv.fsMock).toMatchObject({})
    expect(tenv.fsMock).not.toMatchObject(env.fsMock)
  })
  it('...Env can update input for an unmocked environment', () => {
    const tenv = new Env({}, {test_input: 'test_value'}, false)
    expect(process.env.INPUT_TEST_INPUT).toEqual('test_value')
    env.updateInput({test_input: 'new_value'})
    expect(process.env.INPUT_TEST_INPUT).toEqual('new_value')
    expect(tenv.coreMock).toMatchObject({})
    expect(tenv.coreMock).not.toMatchObject(env.coreMock)
    expect(tenv.fsMock).toMatchObject({})
    expect(tenv.fsMock).not.toMatchObject(env.fsMock)
  })
})
