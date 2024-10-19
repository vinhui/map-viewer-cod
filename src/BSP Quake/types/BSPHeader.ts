import {BSPDirectoryEntry} from './BSPDirectoryEntry'
import {BinaryReader} from '../../utils/BinaryReader'

export class BSPHeader {
    private static readonly LumpCount = 17
    public directory: BSPDirectoryEntry[] = []
    public magic: string = ''
    public version: number = 0
    private readonly reader: BinaryReader

    constructor(reader: BinaryReader) {
        this.reader = reader

        this.readMagic()
        this.readVersion()
        this.readLumps()
    }

    public printInfo(): string {
        let blob = '\r\n=== BSP Header =====\r\n'
        blob += 'Magic Number: ' + this.magic + '\r\n'
        blob += 'BSP Version: ' + this.version + '\r\n'
        blob += 'Header Directory:\r\n'
        this.directory.forEach((entry, index) => {
            blob += `Lump ${index}: ${entry.name} Offset: ${entry.offset} Length: ${entry.length}\r\n`
        })
        return blob
    }

    private readLumps(): void {
        this.directory = []
        for (let i = 0; i < BSPHeader.LumpCount; i++) {
            this.directory.push(new BSPDirectoryEntry(this.reader.readInt32(), this.reader.readInt32()))
        }

        const names = [
            'Entities', 'Textures', 'Planes', 'Nodes', 'Leafs',
            'Leaf faces', 'Leaf brushes', 'Models', 'Brushes',
            'Brush sides', 'Vertexes', 'Mesh vertexes', 'Effects',
            'Faces', 'Lightmaps', 'Light volumes', 'Vis data',
        ]

        for (let i = 0; i < BSPHeader.LumpCount; i++) {
            this.directory[i].name = names[i]
            if (!this.directory[i].validate()) {
                console.error('Invalid lump', names[i])
            }
        }
    }

    private readMagic(): void {
        this.magic = this.reader.readString(4)
    }

    private readVersion(): void {
        this.version = this.reader.readInt32()
    }
}