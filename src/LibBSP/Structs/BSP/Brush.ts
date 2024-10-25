import {ILumpObject} from '../Common/ILumpObject'
import {ILump} from '../Common/Lumps/ILump'
import {BSP, LumpInfo, MapType} from './BSP'
import {Texture} from './Texture'
import {Lump} from '../Common/Lumps/Lump'
import {BrushSide} from './BrushSide'
import {int} from '../../../utils/number'

export class Brush extends ILumpObject<Brush> {
    public get sides(): BrushSide[] {
        const arr: BrushSide[] = []
        for (let i = 0; i < this.numSides; i++) {
            arr.push(this._parent.bsp.brushSides.get(this.firstSideIndex + i))
        }
        return arr
    }

    public get firstSideIndex(): int {
        if (this.mapType == MapType.Nightfire || this.mapType == MapType.STEF2) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(4)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD))
            || (this.mapType & MapType.Source) == MapType.Source) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(0)
        }

        return -1
    }

    public set firstSideIndex(value: int) {
        if (this.mapType == MapType.Nightfire || this.mapType == MapType.STEF2) {
            const view = new DataView(this.data.buffer)
            view.setInt32(4, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD))
            || (this.mapType & MapType.Source) == MapType.Source) {
            const view = new DataView(this.data.buffer)
            view.setInt32(0, value)
        }
    }

    public get numSides(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(0)
        } else if (this.mapType == MapType.STEF2) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(0)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(8)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || (this.mapType & MapType.Source) == MapType.Source) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(4)
        }

        return -1
    }

    public set numSides(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(0, value)
        } else if (this.mapType == MapType.STEF2) {
            const view = new DataView(this.data.buffer)
            view.setInt32(0, value)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(8, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || (this.mapType & MapType.Source) == MapType.Source) {
            const view = new DataView(this.data.buffer)
            view.setInt32(4, value)
        }
    }

    public get texture(): Texture {
        return this._parent.bsp.textures.get(this.textureIndex)
    }

    public get textureIndex(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(2)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(8)
        }

        return -1
    }

    public set textureIndex(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(2, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(8, value)
        }
    }

    public get contents(): int {
        if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(0)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(8)
        }

        return -1
    }

    public set contents(value: int) {
        if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(0, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(8, value)
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Brush> {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const l = new Lump<Brush>(Brush, null, bsp, lumpInfo)
        l.fromData(data, Brush.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }

    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (MapType.IsSubtypeOf(mapType, MapType.CoD)) {
            return 4
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(mapType, MapType.Quake3)
            || mapType == MapType.Nightfire
            || MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 12
        }

        throw new Error(`Lump object Brush does not exist in map type ${mapType} or has not been implemented.`)
    }

    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Source)) {
            return 18
        } else if (MapType.IsSubtypeOf(type, MapType.Quake2)) {
            return 14
        } else if (MapType.IsSubtypeOf(type, MapType.MOHAA)) {
            return 12
        } else if (MapType.IsSubtypeOf(type, MapType.STEF2)) {
            return 13
        } else if (MapType.IsSubtypeOf(type, MapType.FAKK2)) {
            return 11
        } else if (type == MapType.Nightfire) {
            return 15
        } else if (type == MapType.CoD || type == MapType.CoDDemo) {
            return 4
        } else if (type == MapType.CoD2) {
            return 6
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)) {
            return 8
        }

        return -1
    }

    protected ctorCopy(source: Brush, parent: ILump) {
        if (parent?.bsp) {
            if (source.parent?.bsp && source.parent.bsp.mapType == parent.bsp.mapType && source.lumpVersion === parent.lumpInfo.version) {
                this.data = new Uint8Array(source._data)
                return
            } else {
                this.data = new Uint8Array(Brush.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source._parent?.bsp) {
                this.data = new Uint8Array(Brush.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(Brush.GetStructLength(MapType.Undefined, 0))
            }
        }

        this.firstSideIndex = source.firstSideIndex
        this.numSides = source.numSides
        this.textureIndex = source.textureIndex
        this.contents = source.contents
    }
}