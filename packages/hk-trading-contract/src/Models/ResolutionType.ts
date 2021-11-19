export type ResolutionType = '1s' | '1m' | '5m' | '1h' | '4h' | '1d' | '1w'

export function resolutionTypeToSeconds(resolution: ResolutionType, requiredPeriodsCount?: number | null) {
    if (requiredPeriodsCount === null || requiredPeriodsCount === undefined) {
        requiredPeriodsCount = 1
    }
    let daysCount = 0
    if (resolution === '1d') {
        daysCount = requiredPeriodsCount
    }
    else if (resolution === '1m') {
        daysCount = 31 * requiredPeriodsCount
    }
    else if (resolution === '1w') {
        daysCount = 7 * requiredPeriodsCount
    }
    else {
        daysCount = requiredPeriodsCount * parseInt(resolution) / (24 * 60)
    }
    return daysCount * 24 * 60 * 60
}