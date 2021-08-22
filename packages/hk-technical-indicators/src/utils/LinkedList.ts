class Item<T> {
    next: Item<T>
    prev: Item<T>
    data: T
    constructor(data: T, prev?: Item<T>, next?: Item<T>) {
        this.next = next
        if (next) next.prev = this
        this.prev = prev
        if (prev) prev.next = this
        this.data = data
    }
}

export class LinkedList<T> {
    private _head: Item<T>
    private _tail: Item<T>
    private _next: Item<T>
    private _length = 0;
    private _current: Item<T>

    get head() {
        return this._head && this._head.data
    }

    get tail() {
        return this._tail && this._tail.data
    }

    get current() {
        return this._current && this._current.data
    }

    get length() {
        return this._length
    }

    public push(data: T) {
        this._tail = new Item<T>(data, this._tail)
        if (this._length === 0) {
            this._head = this._tail
            this._current = this._head
            this._next = this._head
        }
        this._length++
    }

    public pop() {
        const tail = this._tail
        if (this._length === 0) {
            return
        }
        this._length--
        if (this._length === 0) {
            this._head = this._tail = this._current = this._next = undefined
            return tail.data
        }
        this._tail = tail.prev
        this._tail.next = undefined
        if (this._current === tail) {
            this._current = this._tail
            this._next = undefined
        }
        return tail.data
    }

    public shift() {
        const head = this._head
        if (this._length === 0) {
            return
        }
        this._length--
        if (this._length === 0) {
            this._head = this._tail = this._current = this._next = undefined
            return head.data
        }
        this._head = this._head.next
        if (this._current === head) {
            this._current = this._head
            this._next = this._current.next
        }
        return head.data
    }

    public unshift(data: T) {
        this._head = new Item<T>(data, undefined, this._head)
        if (this._length === 0) {
            this._tail = this._head
            this._next = this._head
        }
        this._length++
    }

    public unshiftCurrent() {
        const current = this._current
        if (current === this._head || this._length < 2) {
            return current && current.data
        }
        // remove
        if (current === this._tail) {
            this._tail = current.prev
            this._tail.next = undefined
            this._current = this._tail
        } else {
            current.next.prev = current.prev
            current.prev.next = current.next
            this._current = current.prev
        }
        this._next = this._current.next
        // unshift
        current.next = this._head
        current.prev = undefined
        this._head.prev = current
        this._head = current
        return current.data
    }

    public removeCurrent() {
        const current = this._current
        if (this._length === 0) {
            return
        }
        this._length--
        if (this._length === 0) {
            this._head = this._tail = this._current = this._next = undefined
            return current.data
        }
        if (current === this._tail) {
            this._tail = current.prev
            this._tail.next = undefined
            this._current = this._tail
        } else if (current === this._head) {
            this._head = current.next
            this._head.prev = undefined
            this._current = this._head
        } else {
            current.next.prev = current.prev
            current.prev.next = current.next
            this._current = current.prev
        }
        this._next = this._current.next
        return current.data
    }

    public resetCursor() {
        this._current = this._next = this._head
        return this
    }

    public next() {
        const next = this._next
        if (next !== undefined) {
            this._next = next.next
            this._current = next
            return next.data
        }
    }
}