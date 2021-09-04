// converts an array to object with index as value
export function arrToObj(arr: any[]) {
    const arrMap = {}
    arr.forEach((ele, i) => {
        arrMap[ele] = i
    })
    return arrMap
}