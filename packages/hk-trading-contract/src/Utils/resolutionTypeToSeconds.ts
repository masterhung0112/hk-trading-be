import { ResolutionType } from '../Models/ResolutionType'

export function resolutionTypeToSeconds(resolutionType: ResolutionType) {
    switch (resolutionType) {
        case '1d':
            return 86400
        case '1h':
            return 3600
        case '1m':
            return 60
        case '1s':
            return 1
        case '1w':
            return 604800
        case '4h':
            return 14400
        case '5m':
            return 300
        default:
            throw new Error(`unsupported resolution Type ${resolutionType}`)
    }
}