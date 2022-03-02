export interface ICsvSerializer {
    writeFile (filePath: string): Promise<void>;
    writeFileSync (filePath: string): void;
}
