import {TestInput} from 'typings/TestInput'

export const defInputs = {
  deploy: '',
  delete: '',
  files: '[]',
  files_added: '[]',
  files_modified: '[]',
  files_removed: '[]',
  order: 'false',
  order_location: 'infrastructure/order',
  mapping_location: 'infrastructure/mappings',
  template_location: 'infrastructure/templates',
  template_nested: 'true',
  branch: 'refs/heads/master'
}
export const normalFileArray: string[] = [
  '.github/actions/deploy_infrastructure/deploy',
  '.github/actions/deploy_infrastructure/deploy_delete_commands.json',
  '.github/actions/deploy_infrastructure/deploy_deploy_commands.json',
  '.github/actions/deploy_infrastructure/deploy_validate_commands.json',
  '.github/actions/deploy_infrastructure/prefix_deploy_commands.json',
  '.github/actions/deploy_infrastructure/suffix_deploy_commands.json',
  '.python-version',
  'cloudformation/.python-version',
  'cloudformation/mappings/mappings.twitch.yml',
  'cloudformation/order/twitch.yml',
  'cloudformation/templates/twitch-sadako.yml',
  'cloudformation/templates/twitch-secrets.yml',
  'functions/twitch-sadako/Makefile',
  'functions/twitch-sadako/craneEventLambda/handler.py',
  'functions/twitch-sadako/craneEventLambda/requirements.txt',
  'functions/twitch-sadako/craneEventLambda/test/craneEventLambda.json',
  'functions/twitch-sadako/followEventLambda/handler.py',
  'functions/twitch-sadako/followEventLambda/requirements.txt',
  'functions/twitch-sadako/followEventLambda/test/followEventLambda_get.json',
  'functions/twitch-sadako/followEventLambda/test/followEventLambda_post.json',
  'functions/twitch-sadako/getCraneStatsLambda/handler.py',
  'functions/twitch-sadako/getCraneStatsLambda/requirements.txt',
  'functions/twitch-sadako/getCraneStatsLambda/test/getCraneStatsLambda.json',
  'functions/twitch-sadako/getTokenLambda/handler.py',
  'functions/twitch-sadako/getTokenLambda/requirements.txt',
  'functions/twitch-sadako/getTokenLambda/test/getTokenLambda.json',
  'functions/twitch-sadako/slackNotifyLambda/handler.py',
  'functions/twitch-sadako/slackNotifyLambda/requirements.txt',
  'functions/twitch-sadako/slackNotifyLambda/test/slackNotifyLambda.json',
  'functions/twitch-sadako/webhookSubscribeCronLambda/handler.py',
  'functions/twitch-sadako/webhookSubscribeCronLambda/requirements.txt',
  'functions/twitch-sadako/webhookSubscribeCronLambda/test/webhookSubscribeCronLambda.json',
  'functions/twitch-sadako/webhookSubscribeLambda/handler.py',
  'functions/twitch-sadako/webhookSubscribeLambda/requirements.txt',
  'functions/twitch-sadako/webhookSubscribeLambda/test/webhookSubscribeLambda.json',
  'functions/twitch-sadako/webhookSubscribeLambda/test/webhookSubscribeLambda_post.json'
]

/**
 * InputHelper Test Inputs
 */
const testFiles = ['input/test1.yaml', 'input/test2.yaml']
const testFilesString = '"["input/test1.yaml","input/test2.yaml"]"'
export const getInputsInputs: TestInput[] = [
  {
    inputs: ['deploy', 'delete', 'delete'],
    events: 'all'
  },
  {
    inputs: ['delete', 'delete', 'delete'],
    events: 'all'
  },
  {
    inputs: ['files', JSON.stringify(testFiles), testFiles],
    events: 'all'
  },
  {
    inputs: ['files_added', JSON.stringify(testFiles), testFiles],
    events: 'all'
  },
  {
    inputs: ['files_modified', JSON.stringify(testFiles), testFiles],
    events: 'all'
  },
  {
    inputs: ['files_removed', JSON.stringify(testFiles), testFiles],
    events: 'all'
  },
  {
    inputs: ['order', 'true', true],
    events: 'all'
  },
  {
    inputs: ['order_location', 'input/order', '/workspace/input/order'],
    events: 'all'
  },
  {
    inputs: ['mapping_location', 'input/mappings', '/workspace/input/mappings'],
    events: 'all'
  },
  {
    inputs: [
      'template_location',
      'input/template',
      '/workspace/input/template'
    ],
    events: 'all'
  },
  {
    inputs: ['template_nested', 'false', false],
    events: 'all'
  },
  {
    inputs: ['branch', 'master', 'master'],
    events: 'all'
  },
  {
    inputs: ['branch', 'refs/pull/92/merge', 'default'],
    events: 'all'
  },
  {
    inputs: ['branch', 'refs/heads/test', 'test'],
    events: 'all'
  }
]
/**
 * UtilsHelper Test inputs
 */
export const errorMessageInputs: TestInput[] = [
  {
    inputs: [
      'getInputs',
      JSON.stringify(
        {name: 'Error', message: 'Error', from: 'getInputs'},
        null,
        2
      ),
      'There was an getting action inputs.'
    ],
    events: 'all'
  },
  {
    inputs: [
      'other',
      JSON.stringify({name: 'Error', message: 'Error', from: 'other'}, null, 2),
      undefined
    ],
    events: 'all'
  }
]
/**
 * main Test inputs
 */
export const mainInputs: TestInput[] = [
  {inputs: ['main', 'main', 'main'], events: 'all'}
]
export {errorMessageInputs as mainErrorInputs}
