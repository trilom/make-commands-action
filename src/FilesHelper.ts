import {readFile, PathLike, exists} from 'fs'
import {resolve, parse} from 'path'
import {InputOptions, InputFiles} from 'typings/Inputs'
import {Products, Product} from 'typings/Products'
import {Order} from 'typings/Order'
import {safeLoad} from 'js-yaml'

/**
 * @function getFiles
 * @param {PathLike} path path to get files for
 * @param {string[]} files original files array, will return this if length !== 0
 * @returns {string[]} files to use either read from FS or from input
 */
export function getFiles(path: PathLike, files: string[]): string[] {
  let returnFiles = files
  if (files.length === 0)
    readFile(resolve(path.toString()), 'utf8', (error, file) => {
      if (error)
        throw new Error(JSON.stringify({name: 'getFiles Error', error, path, file}))
      returnFiles = JSON.parse(file)
    })
  return returnFiles
}

/**
 * @function parseTemplate
 * @description pass in product path, and options.nested and receive a Role type
 * @param {PathLike} path path to template
 * @param {string} template path to templates Inputs.options.locations.template
 * @param {boolean} nested Inputs.options.nested
 * @returns {Role} role object for template
 */
export function parseTemplate(path: PathLike, nested: boolean): {[key:string]: string} {
  const parsed = parse(path.toString())
  const split = nested ? parsed.dir.split('/') : parsed.name.split('-')
  if (nested)
    return {product: split[split.length - 1], name: parsed.name}
  if (split[0] === undefined || split[1] === undefined ) throw new Error(
    JSON.stringify({
      name:'parseTemplate Error',
      error: {path, nested}
    })
  )
  return {product: split[0], name: split[1]}
}

/**
 * @function getProducts
 * @description pass in files object
 * @param {InputFiles} files all, added, modified, removed
 * @param {InputOptions} options input options
 * @returns respond object of mappings and templates for delete and deploy with order
 */
export function getProducts(files: InputFiles, options: InputOptions): Products {
  const products = {} as Products
  Object.keys(files).forEach(key => {
    if (key !== 'all'){
      files[key].forEach(file => {
        if (file.toString().includes(options.locations.template)) {
          const action = (key === 'removed' ? 'delete' : 'deploy')
          const {product, name} = parseTemplate(file, options.nested)
          const mapping = { path: existFile(resolve(`${options.locations.mapping}/${product}`), true, true), changed: false }
          if (!Object.keys(products).includes(product))
            products[product] = {name: product, mapping} as Product
          if (!Object.keys(products[product]).includes(action))
            products[product][action] = [name]
          else if (!products[product][action].includes(name))    
            products[product][action].push(name)
        }
        if (file.toString().includes(options.locations.mapping) && (key === 'added' || key === 'modified')) {
          const product = parse(file.toString()).name.toString()
          const mapping = { path: file, changed: true }
          if (!Object.keys(products).includes(product))
            products[product] = {name: product} as Product
          products[product].mapping = mapping
        }
      })
    }
  })
  Object.keys(products).forEach(key => {
    products[key].order = options.order ? existFile(resolve(`${options.locations.order}/${key}`), true, true).toString() : false
  })
  return products
}

/**
  * @function getOrder
  * @description read order file from repo
  * @param {PathLike} path path to order file
  * @returns {Order} order object
  */
export function getOrder (path: PathLike): Order {
  let orderObj:Order = {}
  readFile(resolve(`${process.env.GITHUB_WORKSPACE}/${path.toString()}`), 'utf8', (error, file) => {
    if (error)
      throw new Error(JSON.stringify({name: 'getOrder readFile Error', error, path, file}))
    const order = safeLoad(file) as Order
    if (typeof order !== 'object')
      throw new TypeError(JSON.stringify({name: 'getOrder Error', message: 'undefined order', path, file}))
    orderObj = order
  })
  return orderObj
}

/**
 * @function existFile
 * @description check if file exists in repo
 * @param {PathLike | string} path path to check if file exists
 * @param {?boolean} inferExt set this to true to infer the extension, for now only yaml/yml
 * @param {?boolean} fileReturn set this to true to return file name if exists
 * @returns {boolean|string} if file exists or not if inferExt is used it will return the real file name
 */
export function existFile (path: PathLike|string, inferExt?:boolean, fileReturn?:boolean):boolean|string {
  let exist:string|boolean = false
  const file = path.toString()
  if (inferExt)
    ['yaml','yml'].forEach(ext => {
      if (!exist) exists(`${file}.${ext}`, e => {
        if (e && file === path) exist = fileReturn ? `${file}.${ext}` : true
      })
    })
  else 
    exists(path, e => { if (e) exist = fileReturn ? file : true })
  return exist
}