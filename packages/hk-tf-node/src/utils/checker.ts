import { config } from '../Config'

export function checker(arrVal: any[]) {
    let dtypes = ''
    let lim
    const intTracker = []
    const floatTracker = []
    const stringTracker = []
    const boolTracker = []

    if (arrVal.length == 0) {
      dtypes = 'string'
    }

    if (arrVal.length < config.dtypeTestLim) {
      lim = arrVal.length - 1
    } else {
      lim = config.dtypeTestLim - 1
    }
    arrVal.forEach((ele, indx) => {
      const count = indx
      if (typeof ele == 'boolean') {
        floatTracker.push(false)
        intTracker.push(false)
        stringTracker.push(false)
        boolTracker.push(true)
      } else if (isNaN(ele) && typeof ele != 'string') {
        floatTracker.push(true)
        intTracker.push(false)
        stringTracker.push(false)
        boolTracker.push(false)
      } else if (!isNaN(Number(ele))) {
        if (ele.toString().includes('.')) {
          floatTracker.push(true)
          intTracker.push(false)
          stringTracker.push(false)
          boolTracker.push(false)
        } else {
          floatTracker.push(false)
          intTracker.push(true)
          stringTracker.push(false)
          boolTracker.push(false)
        }
      } else {
        floatTracker.push(false)
        intTracker.push(false)
        stringTracker.push(true)
        boolTracker.push(false)
      }

      if (count == lim) {
        //if atleast one string appears return string dtype
        const even = (element) => element == true
        if (stringTracker.some(even)) {
          dtypes = 'string'
        } else if (floatTracker.some(even)) {
          dtypes = 'float32'
        } else if (intTracker.some(even)) {
          dtypes = 'int32'
        } else if (boolTracker.some(even)) {
          dtypes = 'boolean'
        } else {
          dtypes = 'undefined'
        }
      }
    })

    return dtypes
}