import { INDframe } from '../core/INDframe'

export function throwStrDtypeError(obj: INDframe, ops: string) {
    if (obj.dtypes[0] == 'string') {
        throw Error(
            `dtype error: String data type does not support ${ops} operation`
        )
    }
}