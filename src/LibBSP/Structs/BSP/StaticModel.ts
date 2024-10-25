import {ILumpObject} from '../Common/ILumpObject'
import {BSP, LumpInfo, MapType} from './BSP'
import {StringExtensions} from '../../Extensions/StringExtensions'
import {Vector3} from '../../Util/Vector'
import {Vector3Extensions} from '../../Extensions/Vector3Extensions'
import {float, int} from '../../../utils/number'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'

export class StaticModel extends ILumpObject<StaticModel> {
    public get name(): string {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            return StringExtensions.ToNullTerminatedString(this.data, 0, 128)
        }

        return null
    }

    public set name(value: string) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            for (let i = 0; i < 128; ++i) {
                this.data[i] = 0
            }
            for (let i = 0; i < 127; i++) {
                this.data[i] = value.charCodeAt(i)
            }
        }
    }

    public get origin(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            return Vector3Extensions.ToVector3(this.data, 128)
        }

        return new Vector3(Number.NaN, Number.NaN, Number.NaN)
    }

    public set origin(value: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            value.getBytes(this.data, 128)
        }
    }

    public get angles(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            return Vector3Extensions.ToVector3(this.data, 140)
        }

        return new Vector3(Number.NaN, Number.NaN, Number.NaN)
    }

    public set angles(value: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            value.getBytes(this.data, 140)
        }
    }

    public get scale(): float {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            const view = new DataView(this.data.buffer)
            return view.getFloat32(152)
        }

        return Number.NaN
    }

    public set scale(value: float) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            const view = new DataView(this.data.buffer)
            view.setFloat32(152, value)
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<StaticModel> {
        if (data === null) {
            throw new Error('ArgumentNullException')
        }

        const l = new Lump<StaticModel>(StaticModel, null, bsp, lumpInfo)
        l.fromData(data, StaticModel.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }


    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (MapType.IsSubtypeOf(mapType, MapType.MOHAA)) {
            return 164
        }

        throw new Error(`Lump object StaticModel does not exist in map type ${mapType} or has not been implemented.`)
    }


    public static GetIndexForLump(type: MapType): int {
        if (type === MapType.MOHAADemo) {
            return 26
        } else if (MapType.IsSubtypeOf(type, MapType.MOHAA)) {
            return 25
        }

        return -1
    }


    protected ctorCopy(source: StaticModel, parent: ILump) {
        this._parent = parent

        if (parent?.bsp) {
            if (source.parent !== null && source.parent.bsp !== null && source.parent.bsp.mapType === parent.bsp.mapType && source.lumpVersion === parent.lumpInfo.version) {
                this.data = new Uint8Array(source.data)
                return
            } else {
                this.data = new Uint8Array(StaticModel.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent !== null && source.parent.bsp !== null) {
                this.data = new Uint8Array(StaticModel.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(StaticModel.GetStructLength(MapType.Undefined, 0))
            }
        }


        this.data = source.data
        this.name = source.name
        this.origin = source.origin
        this.angles = source.angles
        this.scale = source.scale
    }

}