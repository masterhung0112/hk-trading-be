export function throwWrongParamsError(kwargs: any, paramsNeed: string[]) {
    const keys = Object.keys(kwargs)
    const bool = []

    for (let i = 0; i < keys.length; ++i) {
        if (paramsNeed.includes(keys[i])) {
            bool.push(true)
        } else {
            bool.push(false)
        }
    }

    const hasFalse = (element) => element === false
    if (bool.some(hasFalse)) {
        throw Error(
            `Params Error: A specified parameter is not supported. Your params must be any of the following [${paramsNeed}]`
        )
    }
}