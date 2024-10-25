import {ILumpObject} from '../Common/ILumpObject'
import {ColorExtensions} from '../../Extensions/ColorExtensions'
import {Color} from '../../Utils/Color'
import {Vector2, Vector3} from '../../Utils/Vector'
import {ILump} from '../Common/Lumps/ILump'
import {BSP, LumpInfo, MapType} from './BSP'
import {Lump} from '../Common/Lumps/Lump'
import {int} from '../../../utils/number'

export class TextureData extends ILumpObject<TextureData> {

    get reflectivity(): Color {
        const view = new DataView(this.data.buffer)
        return ColorExtensions.FromArgb(
            view.getFloat32(0) * 255,
            view.getFloat32(4) * 255,
            view.getFloat32(8) * 255,
            255)

    }

    set reflectivity(value: Color) {
        const r = value.r / 255
        const g = value.g / 255
        const b = value.b / 255
        new Vector3(r, g, b).getBytes(this.data, 0)

    }

    get textureStringOffset(): bigint {
        return this._parent.bsp.textureTable.get(this.textureStringOffsetIndex)

    }

    get textureStringOffsetIndex(): int {
        const view = new DataView(this.data.buffer)
        return view.getInt32(12)

    }

    set textureStringOffsetIndex(value: int) {
        const view = new DataView(this.data.buffer)
        view.setInt32(12, value)

    }

    get size(): Vector2 {
        const view = new DataView(this.data.buffer)
        return new Vector2(view.getInt32(16), view.getInt32(20))

    }

    set size(value: Vector2) {
        const view = new DataView(this.data.buffer)
        const width = Math.trunc(value.x)
        const height = Math.trunc(value.y)
        view.setInt32(16, width)
        view.setInt32(20, height)

    }

    get viewSize(): Vector2 {
        const view = new DataView(this.data.buffer)
        return new Vector2(
            view.getInt32(24),
            view.getInt32(28),
        )

    }

    set viewSize(value: Vector2) {
        const view = new DataView(this.data.buffer)
        const width = Math.trunc(value.x)
        const height = Math.trunc(value.y)
        view.setInt32(24, width)
        view.setInt32(28, height)

    }

    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (mapType == MapType.Titanfall) {
            return 36
        } else if (MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 32
        }

        throw new Error(`Lump object TextureData does not exist in map type ${mapType} or has not been implemented.`)
    }

    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Source)) {
            return 2
        }
        return -1
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<TextureData> {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const l = new Lump<TextureData>(TextureData, null, bsp, lumpInfo)
        l.fromData(data, TextureData.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }

    protected ctorCopy(source: TextureData, parent: ILump) {

        this._parent = parent

        if (parent?.bsp) {
            if (source.parent != null && source.parent.bsp != null && source.parent.bsp.mapType == parent.bsp.mapType && source.lumpVersion == parent.lumpInfo.version) {
                this.data = new Uint8Array(source._data)
                return
            } else {
                this.data = new Uint8Array(TextureData.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent != null && source.parent.bsp != null) {
                this.data = new Uint8Array(TextureData.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(TextureData.GetStructLength(MapType.Undefined, 0))
            }
        }

        this.reflectivity = source.reflectivity
        this.textureStringOffsetIndex = source.textureStringOffsetIndex
        this.size = source.size
        this.viewSize = source.viewSize
    }
}