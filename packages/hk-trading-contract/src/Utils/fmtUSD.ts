export function fmtUSD(val: number, dec: number): string {
    if (typeof val !== 'number' || typeof dec !== 'number') {
        return '--'
    }
    return '$' + val.toFixed(dec).replace(/\d(?=(\d{3})+(?:\.|$))/g, '$&,')
}