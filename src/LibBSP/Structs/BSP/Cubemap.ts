import {ILumpObject} from '../Common/ILumpObject'
import {Vector3} from '../../Util/Vector'
import {BSP, LumpInfo, MapType} from './BSP'
import {int} from '../../../utils/number'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'

export class Cubemap extends ILumpObject<Cubemap> {
    public get origin(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return new Vector3(view.getInt32(0), view.getInt32(4), view.getInt32(8))
        }

        return new Vector3(0, 0, 0)
    }

    public set origin(value: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(0, value.x)
            view.setInt32(4, value.y)
            view.setInt32(8, value.z)
        }
    }

    public get size(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(12)
        }

        return -1
    }

    public set size(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(12, value)
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Cubemap> {
        if (data === null) {
            throw new Error('ArgumentNullException')
        }

        const l = new Lump<Cubemap>(Cubemap, null, bsp, lumpInfo)
        l.fromData(data, Cubemap.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }


    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 16
        }

        throw new Error(`Lump object Cubemap does not exist in map type ${mapType} or has not been implemented.`)
    }


    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Source)) {
            return 42
        }

        return -1
    }


    protected ctorCopy(source: Cubemap, parent: ILump) {
        this._parent = parent

        if (parent?.bsp) {
            if (source.parent !== null && source.parent.bsp !== null && source.parent.bsp.mapType === parent.bsp.mapType && source.lumpVersion === parent.lumpInfo.version) {
                this.data = new Uint8Array(source._data)
                return
            } else {
                this.data = new Uint8Array(Cubemap.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent !== null && source.parent.bsp !== null) {
                this.data = new Uint8Array(Cubemap.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(Cubemap.GetStructLength(MapType.Undefined, 0))
            }
        }

        this.origin = source.origin
        this.size = source.size
    }
}