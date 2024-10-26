import {ILumpObject, LumpObjDataCtor} from './ILumpObject'
import {ILump} from './Lumps/ILump'
import {BSP, LumpInfo, MapType} from '../BSP/BSP'
import {Vector2, Vector3} from '../../Util/Vector'
import {Vector3Extensions} from '../../Extensions/Vector3Extensions'
import {Plane} from '../../Util/Plane'
import {PlaneExtensions} from '../../Extensions/PlaneExtensions'
import {Lump} from './Lumps/Lump'
import {float, int} from '../../../utils/number'
import {TextureData} from '../BSP/TextureData'

export class TextureInfo extends ILumpObject<TextureInfo> {
    public scale: Vector2
    public rotation: float

    public get uAxis(): Vector3 {
        return Vector3Extensions.ToVector3(this.data)
    }

    public set uAxis(val: Vector3) {
        val.getBytes(this.data, 0)
    }

    public get vAxis(): Vector3 {
        return Vector3Extensions.ToVector3(this.data, 16)
    }

    public set vAxis(val: Vector3) {
        val.getBytes(this.data, 16)
    }

    public get translation(): Vector2 {
        const view = new DataView(this.data.buffer)
        return new Vector2(
            view.getFloat32(12),
            view.getFloat32(28),
        )
    }

    public set translation(val: Vector2) {
        const view = new DataView(this.data.buffer)
        view.setFloat32(12, val.x)
        view.setFloat32(28, val.y)
    }

    public get lightmapUAxis(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector3Extensions.ToVector3(this.data, 32)
        }
        return new Vector3()
    }

    public set lightmapUAxis(val: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            val.getBytes(this.data, 32)
        }
    }

    public get lightmapVAxis(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector3Extensions.ToVector3(this.data, 48)
        }
        return new Vector3()
    }

    public set lightmapVAxis(val: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            val.getBytes(this.data, 48)
        }
    }

    public get lightmapTranslation(): Vector2 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return new Vector2(
                view.getFloat32(44),
                view.getFloat32(60),
            )
        }
        return new Vector2()
    }

    public set lightmapTranslation(val: Vector2) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setFloat32(44, val.x)
            view.setFloat32(60, val.y)
        }
    }

    public get flags(): int {
        if (this.mapType === MapType.DMoMaM) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(88)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(64)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || this.mapType === MapType.Undefined) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(36)
        }

        return -1
    }

    public set flags(value: int) {
        if (this.mapType === MapType.DMoMaM) {
            const view = new DataView(this.data.buffer)
            view.setInt32(88, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(64, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || this.mapType === MapType.Undefined) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, value)
        }
    }

    public get textureIndex(): int {
        if (this.mapType === MapType.DMoMaM) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(92)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(68)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || this.mapType === MapType.Undefined) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(32)
        }

        return -1
    }

    public set textureIndex(value: int) {
        if (this.mapType === MapType.DMoMaM) {
            const view = new DataView(this.data.buffer)
            view.setInt32(92, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(68, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || this.mapType === MapType.Undefined) {
            const view = new DataView(this.data.buffer)
            view.setInt32(32, value)
        }
    }

    public static CreateFromProps(uAxis: Vector3, vAxis: Vector3, translation: Vector2, scale: Vector2, flags: int, texture: int, rotation: float): TextureInfo {
        const c = new TextureInfo(new LumpObjDataCtor(new Uint8Array(40), null))

        c.scale = scale
        c.rotation = rotation
        c.uAxis = uAxis
        c.vAxis = vAxis
        c.translation = translation
        c.flags = flags
        c.textureIndex = texture
        return c
    }

    public static TextureAxisFromPlane(p: Plane): Vector3[] {
        const bestAxis = PlaneExtensions.BestAxis(p)
        return [
            PlaneExtensions.baseAxes[bestAxis * 3 + 1],
            PlaneExtensions.baseAxes[bestAxis * 3 + 2],
        ]
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<TextureInfo> {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const c = new Lump(TextureInfo, null, bsp, lumpInfo)
        c.fromData(data, TextureInfo.GetStructLength(bsp.mapType, lumpInfo.version))
        return c
    }

    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (mapType === MapType.DMoMaM) {
            return 96
        } else if (MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 72
        } else if (mapType === MapType.Nightfire) {
            return 32
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake) ||
            mapType === MapType.Undefined) {
            return 40
        }

        throw new Error(`Lump object TextureInfo does not exist in map type ${mapType} or has not been implemented.`)
    }

    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Quake)
            || MapType.IsSubtypeOf(type, MapType.Source)
        ) {
            return 6
        } else if (type === MapType.Nightfire) {
            return 17
        }
        return -1
    }

    protected ctorData(data: Uint8Array, parent: ILump) {
        super.ctorData(data, parent)
        this.scale = new Vector2(1, 1)
        this.rotation = 0
    }

    protected ctorCopy(source: TextureInfo, parent: ILump) {
        this._parent = parent

        if (parent?.bsp) {
            if (source.parent?.bsp && source.parent.bsp.mapType === parent.bsp.mapType && source.lumpVersion === parent.lumpInfo.version) {
                this.data = new Uint8Array(source.data)
                return
            } else {
                this.data = new Uint8Array(TextureData.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent?.bsp) {
                this.data = new Uint8Array(TextureData.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(TextureData.GetStructLength(MapType.Undefined, 0))
            }
        }

        this.uAxis = source.uAxis
        this.vAxis = source.vAxis
        this.translation = source.translation
        this.lightmapUAxis = source.lightmapUAxis
        this.lightmapVAxis = source.lightmapVAxis
        this.lightmapTranslation = source.lightmapTranslation
        this.flags = source.flags
        this.textureIndex = source.textureIndex
    }
}