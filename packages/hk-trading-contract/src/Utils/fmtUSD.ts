export function fmtUSD(val: number, dec: number): string {
    return '$' + val.toFixed(dec).replace(/\d(?=(\d{3})+(?:\.|$))/g, '$&,')
}