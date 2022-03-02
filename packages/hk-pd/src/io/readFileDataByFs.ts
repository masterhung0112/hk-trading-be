export function readFileDataByFs(filePath: string, encoding?: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const fs = require('fs')
        const encodingType = encoding || 'utf8'
        fs.readFile(filePath, encodingType, (err: any, fileData: string) => {
            if (err) {
                reject(err)
                return
            }
    
            resolve(fileData)
        })
    })
}