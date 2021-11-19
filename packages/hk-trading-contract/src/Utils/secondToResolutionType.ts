import { ResolutionType } from '../Models/ResolutionType'

export function secondToResolutionType(value: number): ResolutionType {
    switch (value) {
        case 86400:
            return '1d'
        case 3600:
            return '1h'
        case 60:
            return '1m'
        case 1:
            return '1s'
        case 604800:
            return '1w'
        case 14400:
            return '4h'
        case 300:
            return '5m'
        default:
            throw new Error(`unsupported value to convert to resolution Type: ${value}`)
    }
}