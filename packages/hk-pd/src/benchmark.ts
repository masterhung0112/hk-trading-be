export type BenchMarkCallback = (start: number, end: number, obj: {
    milliseconds: number,
    ms: number,
    seconds: number,
    minutes: number,
    hours: number,
}) => void

export type BenchMarkCallbackMethod = (callback: (c: BenchMarkCallback) => void) => void

export function benchmark(method: BenchMarkCallbackMethod) {
    const start = +(new Date)

    method && method(function (callback) {
        const end = +(new Date)
        const difference = end - start
        callback && callback(start, end, {
            milliseconds: difference,
            ms: difference,
            seconds: (difference / 1000) % 60,
            minutes: (difference / (1000 * 60)) % 60,
            hours: (difference / (1000 * 60 * 60)) % 24
        })
    })
}

export function timeBenchmark(toMeasure: () => void, repeatTimes = 1) {
    if(typeof(repeatTimes) != 'number'){
        repeatTimes = 1
    }

    if(typeof(toMeasure) === 'function'){
        const startTime = new Date().getTime()
        for (let i = 0; i < repeatTimes; ++i) {
            toMeasure.call(undefined)
        }
        const endTime = new Date().getTime()
        return {
            start:startTime,
            end: endTime,
            estimatedMilliseconds: endTime - startTime
        }
    }
    
   throw new Error('toMeasure is not function')
}