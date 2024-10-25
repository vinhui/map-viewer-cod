import {ILumpObject} from '../Common/ILumpObject'
import {ColorExtensions} from '../../Extensions/ColorExtensions'
import {Color} from '../../Utils/Color'
import {Vector2, Vector3} from '../../Utils/Vector'
import {ILump} from '../Common/Lumps/ILump'
import {BSP, LumpInfo, MapType} from './BSP'
import {Lump} from '../Common/Lumps/Lump'
import {int} from '../../../utils/number'

export class TextureData extends ILumpObject<TextureData> {

/// <summary>
    /// Gets or sets the reflectivity color of this <see cref="TextureData"/>.
    /// </summary>
    get reflectivity(): Color {
        const view = new DataView(this._data.buffer)
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
        new Vector3(r, g, b).getBytes(this._data, 0)

    }

/// <summary>
/// Gets the offset into <see cref="BSP.Textures"/> for the texture name for this <see cref="TextureData"/>.
/// </summary>
    get textureStringOffset(): uint {
        return this._parent.bsp.textureTable.get(this.textureStringOffsetIndex)

    }

/// <summary>
/// Gets or sets the index into <see cref="BSP.TextureTable"/>, which is an offset into <see cref="BSP.Textures"/> for
/// the texture name for this <see cref="TextureData"/>.
/// </summary>
    get textureStringOffsetIndex(): int {
        const view = new DataView(this._data.buffer)
        return view.getInt32(12)

    }

    set textureStringOffsetIndex(value: int) {
        const view = new DataView(this._data.buffer)
        view.setInt32(12, value)

    }

/// <summary>
/// Gets or sets the actual size of the <see cref="Texture"/> referenced by this <see cref="TextureData"/>.
/// </summary>
    get size(): Vector2 {
        const view = new DataView(this._data.buffer)
        return new Vector2(view.getInt32(16), view.getInt32(20))

    }

    set size(value: Vector2) {
        const view = new DataView(this._data.buffer)
        const width = Math.floor(value.x)
        const height = Math.floor(value.y)
        view.setInt32(16, width)
        view.setInt32(20, height)

    }

/// <summary>
/// Gets or sets the internal size of the <see cref="Texture"/> referenced by this <see cref="TextureData"/>.
/// </summary>
    get viewSize(): Vector2 {
        const view = new DataView(this._data.buffer)
        return new Vector2(
            view.getInt32(24),
            view.getInt32(28),
        )

    }

    set viewSize(value: Vector2) {
        const view = new DataView(this._data.buffer)
        const width = Math.floor(value.x)
        const height = Math.floor(value.y)
        view.setInt32(24, width)
        view.setInt32(28, height)

    }

/// <exception cref="ArgumentException">This struct is not valid or is not implemented for the given <paramref name="mapType"/> and <paramref name="lumpVersion"/>.</exception>
    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (mapType == MapType.Titanfall) {
            return 36
        } else if (MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 32
        }

        throw new Error(`Lump object TextureData does not exist in map type ${mapType} or has not been implemented.`)
    }

    /// <summary>
    /// Factory method to parse a <c>byte</c> array into a <see cref="Lump{TextureData}"/>.
    /// </summary>
    /// <param name="data">The data to parse.</param>
    /// <param name="bsp">The <see cref="BSP"/> this lump came from.</param>
    /// <param name="lumpInfo">The <see cref="LumpInfo"/> associated with this lump.</param>
    /// <returns>A <see cref="Lump{TextureData}"/>.</returns>

    /// <exception cref="ArgumentNullException"><paramref name="data"/> parameter was <c>null</c>.</exception>
    LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<TextureData> {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        return new Lump<TextureData>(data, TextureData.GetStructLength(bsp.mapType, lumpInfo.version), bsp, lumpInfo)
    }

/// <summary>
/// Gets the length of this struct's data for the given <paramref name="mapType"/> and <paramref name="lumpVersion"/>.
/// </summary>
/// <param name="mapType">The <see cref="LibBSP.MapType"/> of the BSP.</param>
/// <param name="lumpVersion">The version number for the lump.</param>
/// <returns>The length, in <c>byte</c>s, of this struct.</returns>
    protected ctorCopy(source: TextureData, parent: ILump) {

        this._parent = parent

        if (parent?.bsp) {
            if (source.parent != null && source.parent.bsp != null && source.parent.bsp.mapType == parent.bsp.mapType && source.lumpVersion == parent.lumpInfo.version) {
                this._data = new Uint8Array(source._data)
                return
            } else {
                this._data = new Uint8Array(TextureData.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent != null && source.parent.bsp != null) {
                this._data = new Uint8Array(TextureData.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this._data = new Uint8Array(TextureData.GetStructLength(MapType.Undefined, 0))
            }
        }

        this.reflectivity = source.reflectivity
        this.textureStringOffsetIndex = source.textureStringOffsetIndex
        this.size = source.size
        this.viewSize = source.viewSize
    }
}