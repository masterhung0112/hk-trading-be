export function throwWrongParamsError(kwargs: any, paramsNeed: string[]) {
    const keys = Object.keys(kwargs)

    for (let i = 0; i < keys.length; ++i) {
        if (!paramsNeed.includes(keys[i])) {
            throw Error(
                `Params Error: A specified parameter is not supported. Your params must be any of the following [${paramsNeed}]`
            )
        }
    }
}