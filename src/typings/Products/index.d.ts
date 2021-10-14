import {Order} from 'typings/Order'
import {PathLike} from 'fs'

export interface Products {
  [key:string]: Product
}

export interface Product {
  name: string
  mapping?: {
    path: PathLike
    changed: boolean 
  }
  order: PathLike | false
  delete: string[]
  deploy: string[]
}