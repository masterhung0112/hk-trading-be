export function replaceUndefinedWithNaN(data: any[], isSeries: boolean) {
    if (isSeries) {
        // 1 dimension
        const tempArr = []
        data.forEach((val) => {
            if (typeof val === 'undefined' || val == Infinity || val === null) {
                tempArr.push(NaN)
            } else {
                tempArr.push(val)
            }
        })
        return tempArr
    } else {
        // 2 dimensions
        const fullArr = []
        data.forEach((val) => {
            const tempArr = []
            val.forEach((ele) => {
                if (typeof ele === 'undefined' || ele == Infinity || ele === null) {
                    tempArr.push(NaN)
                } else {
                    tempArr.push(ele)
                }
            })
            fullArr.push(tempArr)
        })
        return fullArr
    }
}