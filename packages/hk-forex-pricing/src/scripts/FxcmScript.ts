import * as df from 'data-forge'
import 'data-forge-fs'
import path from 'path'
import fs from 'fs'
import { RxMySQL } from 'hk-cloud'
import { ForexTickData } from 'hk-trading-contract'

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
                symbol: 'FX:EURUSD',
                timestamp: row.DateTime,
                bid: row.Bid,
                ask: row.Ask
            } as ForexTickData
        }))
        .toString())
}

export const WriteToDB = () => {
    const dataQuote: ForexTickData = {
        symbol: 'FX:EURUSD',
        timestamp: Date.now(),
        bid: 1.234,
        ask: 1.345        
    }
    new RxMySQL('').query('INSERT INTO forex_quotes SET ?', dataQuote).pipe(

    ).subscribe()
}