import path from 'path'
import fs from 'fs'
import { RxMySQL } from 'hk-cloud'
import { CandleQuoteDto } from 'hk-trading-contract'

export const tryReadCsv = () => {
    const csvPath = path.resolve(__dirname, './data/fxcm/2021_1.csv')

    console.log(
        df.fromCSV(fs.readFileSync(csvPath, 'utf16le'))
        // .parseCSV()
        .parseDates('DateTime', 'MM/DD/YYYY HH:mm:ss.SSS')
        .take(1)
        .select((row => {
            // console.log('row', row)
            return {
                sym: 'FX:EURUSD',
                sts: row.DateTime,
                b: row.Bid,
                a: row.Ask
            } as CandleQuoteDto
        }))
        .toString())
}

export const WriteToDB = () => {
    const dataQuote: CandleQuoteDto = {
        sym: 'FX:EURUSD',
        sts: Date.now(),
        b: 1.234,
        a: 1.345
    }
    new RxMySQL('').query('INSERT INTO forex_quotes SET ?', dataQuote).pipe(

    ).subscribe()
}
