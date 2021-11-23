import { CandleStickDTO, ICandlesDeleteStore, ICandlesWriteStore } from 'hk-trading-contract'
import { CsvFileReader } from 'hk-pd'

interface ForexTesterData {
    '<TICKER>': string
    '<DTYYYYMMDD>': string
    '<TIME>': string
    '<OPEN>': string
    '<HIGH>': string
    '<LOW>': string
    '<CLOSE>': string
    '<VOL>': string
}

interface ForexTesterProcessedData extends ForexTesterData {
    sts: Date
}

function parseDate(dateV: string): [number, number, number] {
    const year = parseInt(dateV.slice(0, 4))
    const month = parseInt(dateV.slice(4, 6))
    const day = parseInt(dateV.slice(6, 8))
    return [year, month, day]
}

function parseTime(dateV: string): [number, number, number] {
    const hour = parseInt(dateV.slice(0, 2))
    const minute = parseInt(dateV.slice(2, 4))
    const second = parseInt(dateV.slice(4, 6))
    return [hour, minute, second]
}

const convertRowToCandleStickDTO = (row: ForexTesterProcessedData, index: number): CandleStickDTO => {
    if (row.sts.getUTCMonth() === 3 && row.sts.getUTCDate() === 1 && row.sts.getUTCHours() === 14 && row.sts.getUTCMinutes() === 24) {
        console.log('##found', index)
    }
    return {
        sym: 'Forexite:XAUUSD',
        sts: row.sts,
        bc: parseFloat(row['<CLOSE>']),
        bh: parseFloat(row['<HIGH>']),
        bl: parseFloat(row['<LOW>']),
        bo: parseFloat(row['<OPEN>']),
        resolutionType: '1m',
        v: parseFloat(row['<VOL>'])
    } as CandleStickDTO
}

const columnTransform = {
    sts: (columnValue: ForexTesterData) => {
        const [year, month, date] = parseDate(columnValue['<DTYYYYMMDD>'])
        const [hour, minute, second] = parseTime(columnValue['<TIME>'])
        if (month === 3 && date === 1 && hour === 14 && minute === 24) {
            console.log('##found', columnValue['<DTYYYYMMDD>'], columnValue['<TIME>'])
        }
        return new Date(Date.UTC(year, month, date, hour, minute, second))
    }
}

export const tryReadCsv = (csvPath: string) => {
    return new Promise((resolve) => {
        const csvFileReader = new CsvFileReader(csvPath)
        csvFileReader.parseCSVStep<ForexTesterData>({
            chunkCallback: async (dataDf) => {
                const firstRow = dataDf.generateSeries<ForexTesterProcessedData>(columnTransform)
                    .take(0)
                    .select(convertRowToCandleStickDTO)
                    .toString()
                console.log(`count: ${dataDf.count()}, ${firstRow}`)
            },
            completeCallback: async () => {
                resolve(null)
            }
        })
    })
}

export const writetoDB = (csvPath: string, candleWriteStore: ICandlesWriteStore, candlesDeleteStore: ICandlesDeleteStore) => {
    return new Promise((resolve, reject) => {
        const csvFileReader = new CsvFileReader(csvPath)
        csvFileReader.parseCSVStep<ForexTesterData>({
            chunkCallback: async (dataDf) => {

                try {
                    if (dataDf.count() === 0) {
                        return
                    }
                    const candlesDf = dataDf
                        .generateSeries<ForexTesterProcessedData>(columnTransform)
                        .select(convertRowToCandleStickDTO)
                        //TODO: Find out how to remove duplidate row
                        .distinct((r) => r.sts.toISOString())
                    let minTime: Date | null = null
                    let maxTime: Date | null = null
                    candlesDf.forEach((row) => {
                        if (!minTime) {
                            minTime = row.sts
                        } else if (minTime.getTime() > row.sts.getTime()) {
                            minTime = row.sts
                        }
                        if (!maxTime) {
                            maxTime = row.sts
                        } else if (maxTime.getTime() < row.sts.getTime()) {
                            maxTime = row.sts
                        }
                    })
                    // console.log('process: ', minTime.toISOString(), maxTime.toISOString())
                    await candlesDeleteStore.deleteCandles({
                        symbolId: 'Forexite:XAUUSD',
                        resolutionType: '1m',
                        fromTime: minTime,
                        toTime: maxTime
                    })
                    const candles = candlesDf.toArray()
                    await candleWriteStore.saveManyCandles(candles)
                } catch (err) {
                    reject(err)
                }
            },
            errorCallback: async (err) => {
                reject(err)
            },
            completeCallback: async () => {
                resolve(null)
            }
        })
    })
}
