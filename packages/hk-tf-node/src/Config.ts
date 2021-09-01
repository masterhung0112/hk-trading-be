export class Config {
    tableWidth: number
    tableTruncate: number
    dtypeTestLim: number
    tableMaxRow: number
    tableMaxColInConsole: number
    
    constructor() {
        this.tableWidth = 17 //set the width of each column printed in console
        this.tableTruncate = 16 //set the max number of string before text is truncated in printing
        this.dtypeTestLim = 10
        this.tableMaxRow = 21
        this.tableMaxColInConsole = 7
      }
}