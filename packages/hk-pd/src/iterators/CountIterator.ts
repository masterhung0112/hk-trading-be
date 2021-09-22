export class CountIterator implements Iterator<number> {
    index = 0
    
    next(): IteratorResult<number> {
        return { done: false, value: this.index++ }        
    }
}