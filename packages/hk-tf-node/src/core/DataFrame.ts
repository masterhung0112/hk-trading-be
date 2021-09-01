import { throwWrongParamsError } from '../utils'
import { IDataFrame } from './IDataFrame'
import { indexLoc, IndexLocArgs } from './indexLoc'
import { ILocArgs, LocArgs } from './INDframe'
import { NDframe } from './NDframe'

export class DataFrame extends NDframe implements IDataFrame {
    constructor(data, kwargs = {}) {
        super(data, kwargs)
        this._setColumnProperty() //set column property on DataFrame Class for easy accessing using the format df['colname']
    }

    private _setColumnProperty() {
        //
    }

    /**
     * Prints the first n values in a dataframe
     * @param {rows}  rows --> int
     * @returns DataFrame
     */
    head(rows = 5) {
        if (rows > this.data.length || rows < 1) {
            // Return All values
            return this
        } else {
            // Creates a new dataframe with first [rows]
            const data = this.data.slice(0, rows)
            const idx = this.index.slice(0, rows)
            const config = { columns: this.columnNames, index: idx }
            return new DataFrame(data, config)
        }
    }

    loc(kwargs: LocArgs = {}): IDataFrame {
        const paramsNeeded = ['columns', 'rows']
        throwWrongParamsError(kwargs, paramsNeeded)

        const indexLocArgs: IndexLocArgs = {
            ...kwargs,
            type: 'loc'
        }
        const [newData, columns, rows] = indexLoc(this, indexLocArgs)
        const df = new DataFrame(newData, { columns: columns })
        df.setIndex(rows)
        return df
    }

    iloc(kwargs: ILocArgs = {}): IDataFrame {
        const paramsNeeded = ['columns', 'rows']
        throwWrongParamsError(kwargs, paramsNeeded)

        const indexLocArgs: IndexLocArgs = {
            ...kwargs,
            type: 'iloc'
        }

        const [newData, columns, rows] = indexLoc(this, indexLocArgs)
        const df = new DataFrame(newData, { columns: columns })
        df.setIndex(rows)
        return df
    }
}