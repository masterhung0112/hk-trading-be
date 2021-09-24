import { Direction } from '../core/Direction'
import { ISortSpec } from '../core/ISortSpec'
import { ArrayIterator } from '../iterators/ArrayIterator'

class SortOperation {
    keys: any[] = []

    constructor(public values: any[], public sortSpec: ISortSpec) {

    }

    genKeys(): void {
        if (this.keys.length > 0) {
            // Already cached
            return
        }

        for (const value of this.values) {
            this.keys.push(this.sortSpec.selector(value, 0))
        }
    }

    compare(indexA: number, indexB: number): number {
        this.genKeys()

        const keyA = this.keys[indexA]
        const keyB = this.keys[indexB]
        let comparison = -1
        if (keyA === keyB) {
            comparison = 0
        }
        else if (keyA > keyB) {
            comparison = 1
        }

        return (this.sortSpec.direction === Direction.Descending) ? -comparison : comparison
    }
}

export class OrderedIterable implements Iterable<any> {
    constructor(public iterable: Iterable<any>, public sortSpec: ISortSpec[]) {

    }

    [Symbol.iterator](): Iterator<any> {
        const indexes: number[] = []
        const values: any[] = []
        let index = 0

        for (const value of this.iterable) {
            indexes.push(index)
            values.push(value)
            ++index
        }

        const sortOperations: SortOperation[] = []
        for (const sortSpec of this.sortSpec) {
            sortOperations.push(new SortOperation(values, sortSpec))
        }

        sortOperations[0].genKeys()

        indexes.sort((indexA: number, indexB: number): number => {
            for (const sortOperation of sortOperations) {
                const comparison = sortOperation.compare(indexA, indexB)
                if (comparison !== 0) {
                    return comparison
                }
            }
            return 0
        })

        const sortedValue: any[] = []
        for (const idx of indexes) {
            sortedValue.push(values[idx])
        }

        return new ArrayIterator(sortedValue)
    }
}