import {ILumpObject} from '../Common/ILumpObject'
import {Vector3} from '../../Utils/Vector'
import {BSP, LumpInfo, MapType} from './BSP'
import {int} from '../../../utils/number'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'

export class Cubemap extends ILumpObject<Cubemap> {
    /// <summary>
    /// Gets or sets the position of this <see cref="Cubemap"/>.
    /// </summary>
    public get origin(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            return new Vector3(view.getInt32(0), view.getInt32(4), view.getInt32(8))
        }

        return new Vector3(0, 0, 0)
    }

    public set origin(value: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.setInt32(0, value.x)
            view.setInt32(4, value.y)
            view.setInt32(8, value.z)
        }
    }

    /// <summary>
    /// Gets or sets the size of this <see cref="Cubemap"/>.
    /// </summary>
    public get size(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(12)
        }

        return -1
    }

    public set size(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.setInt32(12, value)
        }
    }

    /// <exception cref="ArgumentNullException"><paramref name="data"/> parameter was <c>null</c>.</exception>
    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Cubemap> {
        if (data == null) {
            throw new Error('ArgumentNullException')
        }

        return new Lump<Cubemap>(data, Cubemap.GetStructLength(bsp.mapType, lumpInfo.version), bsp, lumpInfo)
    }

    /// <summary>
    /// Factory method to parse a <c>byte</c> array into a <see cref="Lump{Cubemap}"/>.
    /// </summary>
    /// <param name="data">The data to parse.</param>
    /// <param name="bsp">The <see cref="BSP"/> this lump came from.</param>
    /// <param name="lumpInfo">The <see cref="LumpInfo"/> associated with this lump.</param>
    /// <returns>A <see cref="Lump{Cubemap}"/>.</returns>

/// <exception cref="ArgumentException">This struct is not valid or is not implemented for the given <paramref name="mapType"/> and <paramref name="lumpVersion"/>.</exception>
    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 16
        }

        throw new Error(`Lump object Cubemap does not exist in map type ${mapType} or has not been implemented.`)
    }

/// <summary>
/// Gets the length of this struct's data for the given <paramref name="mapType"/> and <paramref name="lumpVersion"/>.
/// </summary>
/// <param name="mapType">The <see cref="LibBSP.MapType"/> of the BSP.</param>
/// <param name="lumpVersion">The version number for the lump.</param>
/// <returns>The length, in <c>byte</c>s, of this struct.</returns>

    /// <returns>Index for this lump, or -1 if the format doesn't have this lump.</returns>
    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Source)) {
            return 42
        }

        return -1
    }

    /// <summary>
    /// Gets the index for this lump in the BSP file for a specific map format.
    /// </summary>
    /// <param name="type">The map type.</param>

    protected ctorCopy(source: Cubemap, parent: ILump) {
        this._parent = parent

        if (parent?.bsp) {
            if (source.parent != null && source.parent.bsp != null && source.parent.bsp.mapType == parent.bsp.mapType && source.lumpVersion == parent.lumpInfo.version) {
                this._data = new Uint8Array(source._data)
                return
            } else {
                this._data = new Uint8Array(Cubemap.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent != null && source.parent.bsp != null) {
                this._data = new Uint8Array(Cubemap.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this._data = new Uint8Array(Cubemap.GetStructLength(MapType.Undefined, 0))
            }
        }

        this.origin = source.origin
        this.size = source.size
    }
}