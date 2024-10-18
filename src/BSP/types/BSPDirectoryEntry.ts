export class BSPDirectoryEntry {
    public offset: number
    public length: number
    public name: string = ''

    constructor(offset: number, length: number) {
        this.offset = offset
        this.length = length
    }

    public validate(): boolean {
        return this.length % 4 === 0
    }
}