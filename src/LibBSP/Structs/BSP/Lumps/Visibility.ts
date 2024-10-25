import {ILump} from '../../Common/Lumps/ILump'
import {BSP, LumpInfo, MapType} from '../BSP'
import {byte, int} from '../../../../utils/number'
import {Leaf} from '../Leaf'

export class Visibility implements ILump {
    public bsp: BSP
    public data: Uint8Array

    constructor(data: Uint8Array, bsp?: BSP, lumpInfo: LumpInfo = new LumpInfo()) {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        this.data = data
        this.bsp = bsp
        this._lumpInfo = lumpInfo
    }

    protected _lumpInfo: LumpInfo

    public get lumpInfo(): LumpInfo {
        return this._lumpInfo
    }

    public get length(): int {
        return this.data.length
    }

    public get numClusters() {
        if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake3)
            || MapType.IsSubtypeOf(this.bsp.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(0)
        }

        return -1
    }

    public set numClusters(value: int) {
        if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake3)
            || MapType.IsSubtypeOf(this.bsp.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(0, value)
        }
    }

    public get clusterSize(): int {
        if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(4)
        }
        return -1
    }

    public set clusterSize(value: int) {
        if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(4, value)
        }
    }

    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Quake2)) {
            return 3
        } else if (MapType.IsSubtypeOf(type, MapType.Quake)
            || MapType.IsSubtypeOf(type, MapType.Source)) {
            return 4
        } else if (MapType.IsSubtypeOf(type, MapType.STEF2)) {
            return 17
        } else if (type == MapType.MOHAADemo) {
            return 16
        } else if (MapType.IsSubtypeOf(type, MapType.FAKK2)
            || MapType.IsSubtypeOf(type, MapType.MOHAA)) {
            return 15
        } else if (type == MapType.CoD
            || type == MapType.CoDDemo) {
            return 28
        } else if (type == MapType.CoD2) {
            return 36
        } else if (type == MapType.Nightfire) {
            return 7
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3) && type != MapType.CoD4) {
            return 16
        }

        return -1
    }

    public canSee(leaf: Leaf, other: int): boolean {
        let offset = this.getOffsetForClusterPVS(leaf.visibility)
        if (offset < 0) {
            offset = leaf.visibility
        }

        for (let i = 0; i < leaf.parent.bsp.leaves.length; i++) {
            if (this.data[offset] === 0 && this.bsp.mapType !== MapType.Nightfire && !MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake)) {
                i += 8 * this.data[offset + 1]
                if (i > other) {
                    return false
                }
                offset++
            } else {
                for (let bit = 1; bit !== 0; bit *= 2, i++) {
                    if (other === i) {
                        return (this.data[offset] & bit) > 0
                    }
                }
            }
        }
        return false
    }

    public getOffsetForClusterPVS(cluster: int): int {
        if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.bsp.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(4 + cluster * 8)
        }
    }

    public getOffsetForClusterPAS(cluster: int): int {
        if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.bsp.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(8 + cluster * 8)
        }
    }

    public getBytes(lumpOffset = 0): Uint8Array {
        return this.data
    }

    public decompress(data: Uint8Array): Uint8Array {
        const decompressed: byte[] = []

        for (let i = 0; i < data.length; i++) {
            if (data[i] === 0) {
                i++
                for (let j = 0; j < data[i]; j++) {
                    decompressed.push(0)
                }
            } else {
                decompressed.push(data[i])
            }
        }

        return new Uint8Array(decompressed)
    }

    public compress(data: Uint8Array): Uint8Array {
        const compressed = new Uint8Array(data.length)
        let writeOffset = 0

        let zeroCount = 0
        for (let i = 0; i < data.length; i++) {
            if (data[i] === 0) {
                ++zeroCount
            }

            if (data[i] !== 0 || i === data.length - 1) {
                if (zeroCount > 0) {
                    while (zeroCount > 255) {
                        compressed[writeOffset++] = 0
                        compressed[writeOffset++] = 255
                        zeroCount -= 255
                    }
                    compressed[writeOffset++] = 0
                    compressed[writeOffset++] = zeroCount % 255
                    zeroCount = 0
                }

                if (i < data.length && data[i] !== 0) {
                    compressed[writeOffset++] = data[i]
                }
            }
        }

        return compressed.slice(0, writeOffset)
    }
}