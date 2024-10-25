export class BinaryReader {
    private readonly data: Uint8Array
    private readonly view: DataView
    private readonly littleEndian: boolean

    constructor(data: Uint8Array, littleEndian: boolean = true) {
        this.data = data
        this.view = new DataView(data.buffer)
        this.littleEndian = littleEndian
    }

    private _position: number = 0

    get position(): number {
        return this._position
    }

    public seek(position: number): void {
        this._position = position
    }

    public readUInt8(): number {
        return this.view.getUint8(this._position++)
    }

    public readInt8(): number {
        return this.view.getInt8(this._position++)
    }

    public readByte(): number {
        return this.readUInt8()
    }

    public readUInt16(): number {
        const result = this.view.getUint16(this._position, this.littleEndian)
        this._position += 2
        return result
    }

    public readInt16(): number {
        const result = this.view.getInt16(this._position, this.littleEndian)
        this._position += 2
        return result
    }

    public readUInt32(): number {
        const result = this.view.getUint32(this._position, this.littleEndian)
        this._position += 4
        return result
    }

    public readInt32(): number {
        const result = this.view.getInt32(this._position, this.littleEndian)
        this._position += 4
        return result
    }

    public readFloat32(): number {
        const result = this.view.getFloat32(this._position, this.littleEndian)
        this._position += 4
        return result
    }

    public readSingle(): number {
        return this.readFloat32()
    }

    public readString(length: number): string {
        let str = ''
        for (let i = 0; i < length; i++) {
            str += String.fromCharCode(this.readUInt8())
        }
        return str
    }

    public readBytes(count: number): Uint8Array {
        const data = this.data.slice(this._position, this._position + count)
        this._position += count
        return data
    }
}