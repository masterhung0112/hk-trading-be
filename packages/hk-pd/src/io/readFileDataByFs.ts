export function readFileDataByFs(filePath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const fs = require('fs')
        fs.readFile(filePath, 'utf8', (err: any, fileData: string) => {
            if (err) {
                reject(err)
                return
            }
    
            resolve(fileData)
        })
    })
}