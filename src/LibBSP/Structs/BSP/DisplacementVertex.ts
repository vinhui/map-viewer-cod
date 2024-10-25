import {ILumpObject} from '../Common/ILumpObject'
import {Vector3} from '../../Util/Vector'
import {BSP, LumpInfo, MapType} from './BSP'
import {Vector3Extensions} from '../../Extensions/Vector3Extensions'
import {float, int} from '../../../utils/number'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'

export class DisplacementVertex extends ILumpObject<DisplacementVertex> {
    public get normal(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector3Extensions.ToVector3(this.data)
        }

        return new Vector3(0, 0, 0)
    }

    public set normal(value: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            value.getBytes(this.data, 0)
        }
    }

    public get magnitude(): float {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getFloat32(12)
        }

        return -1
    }

    public set magnitude(value: float) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setFloat32(12, value)
        }
    }

    public get alpha(): float {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getFloat32(16)
        }

        return -1
    }

    public set alpha(value: float) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setFloat32(16, value)
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<DisplacementVertex> {
        if (data === null) {
            throw new Error('ArgumentNullException')
        }

        const l = new Lump<DisplacementVertex>(DisplacementVertex, null, bsp, lumpInfo)
        l.fromData(data, DisplacementVertex.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }


    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 20
        }

        throw new Error(`Lump object DisplacementVertex does not exist in map type ${mapType} or has not been implemented.`)

    }


    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Source)) {
            return 33
        }

        return -1
    }


    protected ctorCopy(source: DisplacementVertex, parent: ILump) {
        this._parent = parent

        if (parent?.bsp) {
            if (source.parent !== null && source.parent.bsp !== null && source.parent.bsp.mapType === parent.bsp.mapType && source.lumpVersion === parent.lumpInfo.version) {
                this.data = new Uint8Array(source._data)
                return
            } else {
                this.data = new Uint8Array(DisplacementVertex.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent !== null && source.parent.bsp !== null) {
                this.data = new Uint8Array(DisplacementVertex.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(DisplacementVertex.GetStructLength(MapType.Undefined, 0))
            }
        }

        this.normal = source.normal
        this.magnitude = source.magnitude
        this.alpha = source.alpha
    }
}