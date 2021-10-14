export interface LodashMock {
  _isEqual: (value: any, other: any) => boolean
  _union: <T>(...arrays: _.List<T>[]) => T[]
  _uniqWith: <T>(array: _.List<T>, comparator?: _.Comparator<T>) => T[]
}
