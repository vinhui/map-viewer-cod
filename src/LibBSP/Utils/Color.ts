import {byte} from '../../utils/number'

export class Color {
    public r: byte
    public g: byte
    public b: byte
    public a: byte

    constructor(r?: byte, g?: byte, b?: byte, a?: byte) {
        this.r = r ?? 0
        this.g = g ?? 0
        this.b = b ?? 0
        this.a = a ?? 0
    }

    public getBytes(arr?: Uint8Array, startIndex: byte = 0): Uint8Array {
        const d = arr ?? new Uint8Array(4)
        arr[startIndex] = this.r
        arr[startIndex + 1] = this.g
        arr[startIndex + 2] = this.b
        arr[startIndex + 3] = this.a
        return d
    }
}