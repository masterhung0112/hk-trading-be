import { ResolutionType } from 'hk-trading-contract'

export function resolutionTypeToSecond(resolutionType: ResolutionType) {
    switch (resolutionType) {
        case '1d':
            return (24 * 60 * 60)
        case '1h':
            return (60 * 60)
        case '1m':
            return 60
        case '1s':
            return 1
        case '1w':
            return (7 * 24 * 60 * 60)
        case '4h':
            return (4 * 60 * 60)
        case '5m':
            return (5 * 60)
        default:
            throw new Error(`unsupported resolution Type ${resolutionType}`)
    }
}