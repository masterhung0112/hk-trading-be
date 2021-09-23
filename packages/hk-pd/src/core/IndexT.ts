import { Series } from ".";
import { determineType } from "../utils/determineType";
import { IIndex, IIndexPredicateFn } from "./IIndex";
import { SeriesConfigFn } from "./SeriesConfigFn";
import moment from "dayjs"

export class Index<IndexT> extends Series<number, IndexT> implements IIndex<IndexT> {
    private _type?: string

    constructor(config?: any | SeriesConfigFn<number, IndexT>) {
        super(config)
    }

    getType(): string {
        if (!this._type) {
            if (this.any()) {
                this._type = determineType(this.first())
            } else {
                this._type = 'empty'
            }
        }
        return this._type
    }

    getLessThan(): IIndexPredicateFn {
        switch (this.getType()) {
            case "date":
                return (d1: Date, d2: Date) => moment(d1).isBefore(d2);

            case "string":
            case "number":
                return (v1: any, v2: any) => v1 < v2;

            case "empty":
                return () => true; // Series is empty, so this makes no difference.

            default:
                throw new Error("No less than operation available for type: " + this.getType());
        }
    }

    getLessThanOrEqualTo (): IIndexPredicateFn {
        return (v1: any, v2: any) => !this.getGreaterThan()(v1, v2); //TODO: Should expand  this out.
    }

    getGreaterThan (): IIndexPredicateFn {
        switch (this.getType()) {
            case "date":
                return (d1: Date, d2: Date) => moment(d1).isAfter(d2);

            case "string":
            case "number":
                return (v1: any, v2: any) => v1 > v2;

            case "empty":
                return () => true; // Series is empty, so this makes no difference.

            default:
                throw new Error("No greater than operation available for type: " + this.getType());
        }
    }
}