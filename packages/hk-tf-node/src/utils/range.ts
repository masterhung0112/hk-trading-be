import { linspace } from '@tensorflow/tfjs-node'

// generate integers between two set of numbers
export function range(start: number, end: number) {
    return linspace(start, end, end - start + 1).arraySync()
}