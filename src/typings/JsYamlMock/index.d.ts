
import {LoadOptions} from 'js-yaml'

export interface JsYamlMock {
  safeLoad: (str: string, opts?: LoadOptions) => any
}