import { isObject } from './isObject'

// converts a 2D array of array to 1D for Series Class
export function convert2DTo1D(data: any[]): string[] {
    const newData: string[] = []
    data.map((val) => {
      if (isObject(val)) {
        newData.push(JSON.stringify(val))
      } else {
        newData.push(`${val}`)
      }
    })
    return newData
}