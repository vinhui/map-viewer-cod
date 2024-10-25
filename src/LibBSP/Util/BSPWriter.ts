import {BSP} from '../Structs/BSP/BSP'
import {ILump} from '../Structs/Common/Lumps/ILump'
import {GameLump} from '../Structs/BSP/Lumps/GameLump'

export class BSPWriter {
    private readonly _bsp: BSP
    private readonly _numLumps: number

    constructor(bsp: BSP) {
        this._bsp = bsp
        this._numLumps = BSP.GetNumLumps(bsp.mapType)
    }

    public writeBSP(): Uint8Array {
        const lumpBytes: Uint8Array[] = this.getLumpBytes()
        const header = this._bsp.header.regenerate()

        this._bsp.updateHeader(header)

        return this.writeAllData(header.data, lumpBytes)
    }

    private getLumpBytes(): Uint8Array[] {
        const lumpBytes: Uint8Array[] = []
        let currentOffset = this._bsp.header.length

        for (let i = 0; i < this._numLumps; i++) {
            let lump: ILump
            if (i === GameLump.GetIndexForLump(this._bsp.mapType)) {
                lump = this._bsp.gameLump
            } else {
                lump = this._bsp.getLoadedLump(i)
            }

            let bytes: Uint8Array
            if (lump) {
                bytes = lump.getBytes(currentOffset)
            } else {
                if (this._bsp.reader.bspFile) {
                    bytes = this._bsp.reader.readLump(this._bsp.header.getLumpInfo(i))
                } else {
                    bytes = new Uint8Array(0)
                }
            }

            lumpBytes[i] = bytes
            currentOffset += bytes.length
        }

        return lumpBytes
    }

    private writeAllData(header: Uint8Array, lumpBytes: Uint8Array[]): Uint8Array {
        let size = header.length
        for (let l of lumpBytes) {
            size += l.length
        }

        const output = new Uint8Array(size)

        output.set(header, 0)
        let offset = header.length

        for (let l of lumpBytes) {
            output.set(l, offset)
            offset += l.length
        }

        return output
    }
}