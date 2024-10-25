import {BSP, LumpInfo, MapType} from '../BSP'
import {ILump} from '../../Common/Lumps/ILump'
import {int} from '../../../../utils/number'

export class Lightmaps implements ILump {
    public bsp: BSP
    public data: Uint8Array

    constructor(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo = new LumpInfo()) {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        this.data = data
        this.bsp = bsp
        this._lumpInfo = lumpInfo
    }

    private _lumpInfo: LumpInfo

    public get lumpInfo(): LumpInfo {
        return this._lumpInfo
    }

    public get length(): int {
        return this.data.length
    }

    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.CoD)) {
            return 1
        } else if (MapType.IsSubtypeOf(type, MapType.UberTools)) {
            return 2
        } else if (MapType.IsSubtypeOf(type, MapType.Quake2)) {
            return 7
        } else if (MapType.IsSubtypeOf(type, MapType.Quake)
            || MapType.IsSubtypeOf(type, MapType.Source)) {
            return 8
        } else if (type == MapType.Nightfire) {
            return 10
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)) {
            return 14
        }

        return -1
    }

    public getBytes(lumpOffset = 0): Uint8Array {
        return this.data
    }
}