import {ILumpObject} from './ILumpObject'
import {ILump} from './Lumps/ILump'
import {BSP, LumpInfo, MapType} from '../BSP/BSP'
import {Vector2, Vector3} from '../../Utils/Vector'
import {Vector3Extensions} from '../../Extensions/Vector3Extensions'
import {Plane} from '../../Utils/Plane'
import {PlaneExtensions} from '../../Extensions/PlaneExtensions'
import {Lump} from './Lumps/Lump'

export class TextureInfo implements ILumpObject {
    public scale: Vector2
    public rotation: float

    private _parent: ILump

    public get parent(): ILump {
        return this._parent
    }

    private _data: Uint8Array

    public get data(): Uint8Array {
        return this._data
    }

    public get mapType(): MapType {
        if (!this._parent?.bsp) {
            return MapType.Undefined
        }
        return this._parent.bsp.mapType
    }

    public get lumpVersion(): int {
        if (!this._parent) {
            return 0
        }
        return this._parent.lumpInfo.version
    }

    public get uAxis(): Vector3 {
        return Vector3Extensions.ToVector3(this._data)
    }

    public set uAxis(val: Vector3) {
        val.getBytes(this._data, 0)
    }

    public get vAxis(): Vector3 {
        return Vector3Extensions.ToVector3(this._data, 16)
    }

    public set vAxis(val: Vector3) {
        val.getBytes(this._data, 16)
    }

    public get translation(): Vector2 {
        const view = new DataView(this._data.buffer)
        return new Vector2(
            view.getFloat32(12),
            view.getFloat32(28),
        )
    }

    public set translation(val: Vector2) {
        const view = new DataView(this._data.buffer)
        view.setFloat32(12, val.x)
        view.setFloat32(28, val.y)
    }

    public get lightmapUAxis(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector3Extensions.ToVector3(this._data, 32)
        }
        return new Vector3()
    }

    public set lightmapUAxis(val: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            val.getBytes(this._data, 32)
        }
    }

    public get lightmapVAxis(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector3Extensions.ToVector3(this._data, 48)
        }
        return new Vector3()
    }

    public set lightmapVAxis(val: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            val.getBytes(this._data, 48)
        }
    }

    public get lightmapTranslation(): Vector2 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            return new Vector2(
                view.getFloat32(44),
                view.getFloat32(60),
            )
        }
        return new Vector2()
    }

    public set lightmapTranslation(val: Vector2) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.setFloat32(44, val.x)
            view.setFloat32(60, val.y)
        }
    }

    public get flags(): int {
        if (this.mapType == MapType.DMoMaM) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(88)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(64)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || this.mapType == MapType.Undefined) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(36)
        }

        return -1
    }

    public set flags(value: int) {
        if (this.mapType == MapType.DMoMaM) {
            const view = new DataView(this._data.buffer)
            view.setInt32(88, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.setInt32(64, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || this.mapType == MapType.Undefined) {
            const view = new DataView(this._data.buffer)
            view.setInt32(36, value)
        }
    }

    public get textureIndex(): int {
        if (this.mapType == MapType.DMoMaM) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(92)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(68)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || this.mapType == MapType.Undefined) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(32)
        }

        return -1
    }

    public set textureIndex(value: int) {
        if (this.mapType == MapType.DMoMaM) {
            const view = new DataView(this._data.buffer)
            view.setInt32(92, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.setInt32(68, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || this.mapType == MapType.Undefined) {
            const view = new DataView(this._data.buffer)
            view.setInt32(32, value)
        }
    }

    public static CreateFromData(data: Uint8Array, parent?: ILump): TextureInfo {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const c = new TextureInfo()
        c._data = data
        c._parent = parent
        c.scale = new Vector2(1, 1)
        c.rotation = 0
        return c
    }

    public static CreateFromProps(uAxis: Vector3, vAxis: Vector3, translation: Vector2, scale: Vector2, flags: int, texture: int, rotation: float): TextureInfo {
        const c = new TextureInfo()
        c._data = new Uint8Array(40)
        c._parent = null

        c.scale = scale
        c.rotation = rotation
        c.uAxis = uAxis
        c.vAxis = vAxis
        c.translation = translation
        c.flags = flags
        c.textureIndex = texture
        return c
    }

    public static CreateCopy(source: TextureInfo, parent?: ILump) {
        const c = new TextureInfo()
        c._parent = parent
        c.scale = source.scale
        c.rotation = source.rotation

        if (parent?.bsp) {
            if (source._parent?.bsp && source._parent.bsp.mapType === parent.bsp.mapType && source.lumpVersion === parent.lumpInfo.version) {
                c._data = new Uint8Array(source.data.buffer)
                return c
            } else {
                c._data = new Uint8Array(TextureInfo.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent?.bsp) {
                c._data = new Uint8Array(TextureInfo.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                c._data = new Uint8Array(TextureInfo.GetStructLength(MapType.Undefined, 0))
            }
        }

        c.uAxis = source.uAxis
        c.vAxis = source.vAxis
        c.translation = source.translation
        c.lightmapUAxis = source.lightmapUAxis
        c.lightmapVAxis = source.lightmapVAxis
        c.lightmapTranslation = source.lightmapTranslation
        c.flags = source.flags
        c.textureIndex = source.textureIndex
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
}