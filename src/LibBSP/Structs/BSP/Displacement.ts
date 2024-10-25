import {ILumpObject} from '../Common/ILumpObject'
import {Vector3} from '../../Utils/Vector'
import {BSP, LumpInfo, MapType} from './BSP'
import {Vector3Extensions} from '../../Extensions/Vector3Extensions'
import {float, int, ushort} from '../../../utils/number'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'

export class Displacement extends ILumpObject<Displacement> {
    public get startPosition(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector3Extensions.ToVector3(this._data)
        }

        return new Vector3(0, 0, 0)
    }

    public set startPosition(value: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            value.getBytes(this._data, 0)
        }
    }

    /// <summary>
    /// Enumerates the flags for the triangles in this <see cref="Displacement"/>.

    /// </summary>
    public get vertices(): DisplacementVertex[] {
        const numVertices = this.numVertices
        const arr: DisplacementVertex[] = []
        for (let i = 0; i < numVertices; ++i) {
            arr.push(this._parent.bsp.displacementVertices.get(this.firstVertexIndex + 1))
        }
        return arr
    }

    /// </summary>
    public get firstVertexIndex(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(12)
        }

        return -1
    }

    /// <summary>
    /// Gets or sets the index of the first Displacement Triangle used by this <see cref="Displacement"/>.

    public set firstVertexIndex(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.setInt32(12, value)
        }
    }

    /// </summary>
    public get triangles(): ushort[] {
        const arr: ushort[] = []
        for (let i = 0; i < this.numTriangles; ++i) {
            arr.push(this._parent.bsp.displacementTriangles.get(this.firstTriangleIndex + 1))
        }
        return arr
    }

    /// <summary>
    /// Gets or sets the power of this <see cref="Displacement"/>.

    public get firstTriangleIndex(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(16)
        }

        return -1
    }

    public set firstTriangleIndex(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.setInt32(16, value)
        }
    }

    /// <summary>
    /// Gets the number of vertices this <see cref="Displacement"/> uses, based on <see cref="Power"/>.

    /// </summary>
    public get power(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(20)
        }

        return -1
    }

    public set power(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.setInt32(20, value)
        }
    }

    public get numVertices(): int {
        const numSideVerts = Math.floor(Math.pow(2, this.power)) + 1
        return numSideVerts * numSideVerts
    }

    /// <summary>
    /// Gets the number of triangles this <see cref="Displacement"/> has, based on <see cref="Power"/>.
    /// </summary>

    public get numTriangles(): int {
        const side = this.power * this.power
        return 2 * side * side
    }

    public set numTriangles(value: int) {

    }

    /// <summary>
    /// Gets or sets the minimum allowed tesselation for this <see cref="Displacement"/>.
    /// </summary>
    public get minimumTesselation(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(24)
        }

        return -1
    }

    public set minimumTesselation(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.setInt32(24, value)
        }
    }

    /// <summary>
    /// Gets or sets the lighting smoothing angle for this <see cref="Displacement"/>.
    /// </summary>
    public get smoothingAngle(): float {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            return view.getFloat32(28)
        }

        return 0
    }

    public set smoothingAngle(value: float) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.setFloat32(28, value)
        }
    }

    /// <summary>
    /// Gets or sets the contents flags for this <see cref="Displacement"/>.
    /// </summary>
    public get contents(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(32)
        }

        return -1
    }

    public set contents(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.setInt32(32, value)
        }
    }

    /// <summary>
    /// Gets the <see cref="LibBSP.Face"/> this <see cref="Displacement"/> was made from, for texturing and other information.
    /// </summary>
    public get face(): Face {
        return this.parent.bsp.faces.get(this.faceIndex)
    }

    /// <summary>
    /// Gets or sets the index of the <see cref="LibBSP.Face"/> this <see cref="Displacement"/> was made from, for texturing and other information.
    /// </summary>
    public get faceIndex(): int {
        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(36)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            return view.getUint16(36)
        }

        return -1
    }

    public set faceIndex(value: int) {


        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this._data.buffer)
            view.setInt32(36, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.setInt16(36, value)
        }
    }

    /// <summary>
    /// Get or sets the index of the lightmap alpha for this <see cref="Displacement"/>.
    /// </summary>
    public get lightmapAlphaStart(): int {
        const view = new DataView(this._data.buffer)
        return view.getInt32(40)
    }

    public set lightmapAlphaStart(value: int) {
        const view = new DataView(this._data.buffer)
        view.setInt16(40, value)
    }

    /// <summary>
    /// Gets or sets the index of the first lightmap sample position used by this <see cref="Displacement"/>.
    /// </summary>
    public get lightmapSamplePositionStart(): int {
        const view = new DataView(this._data.buffer)
        return view.getInt32(44)
    }

    public set lightmapSamplePositionStart(value: int) {
        const view = new DataView(this._data.buffer)
        view.setInt16(44, value)
    }

    /// <summary>
    /// The <see cref="DisplacementNeighbor"/>s in this <see cref="Displacement"/>.
    /// </summary>
    private _neighbors: DisplacementNeighbor[]
    public get neighbors(): DisplacementNeighbor[] {
        return this._neighbors
    }

    /// <summary>
    /// The <see cref="DisplacementCornerNeighbor"/>s in this <see cref="Displacement"/>.
    /// </summary>
    private _cornerNeighbors: DisplacementCornerNeighbor[]
    public get cornerNeighbors(): DisplacementCornerNeighbor[] {
        return this._cornerNeighbors
    }

    /// <summary>
    /// Gets or sets the allowed vertices for this <see cref="Displacement"/>.
    /// </summary>
    public get allowedVertices(): Uint32Array {
        const allowedVertices: Uint32Array = new Uint32Array(10)
        let offset = -1

        if (this.mapType == MapType.Vindictus) {
            offset = 192
        } else if (this.mapType == MapType.Source22) {
            offset = 140
        } else if (this.mapType == MapType.Source23) {
            offset = 144
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            offset = 136
        }

        if (offset >= 0) {
            allowedVertices.set(this._data, offset)
        }
        return allowedVertices
    }

    public set allowedVertices(value: Uint32Array) {
        if (value.length != 10) {
            throw new Error('AllowedVerts array must have 10 elements.')
        }
        let offset = -1

        if (this.mapType == MapType.Vindictus) {
            offset = 192
        } else if (this.mapType == MapType.Source22) {
            offset = 140
        } else if (this.mapType == MapType.Source23) {
            offset = 144
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            offset = 136
        }

        if (offset >= 0) {
            this._data.set(value, offset)
        }
    }

    /// <exception cref="ArgumentNullException"><paramref name="data"/> parameter was <c>null</c>.</exception>
    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Displacement> {
        if (data == null) {
            throw new Error('ArgumentNullException')
        }

        return new Lump<Displacement>(data, Displacement.GetStructLength(bsp.mapType, lumpInfo.version), bsp, lumpInfo)
    }

/// <exception cref="ArgumentException">This struct is not valid or is not implemented for the given <paramref name="mapType"/> and <paramref name="lumpVersion"/>.</exception>
    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (mapType == MapType.Source23) {
            return 184
        } else if (mapType == MapType.Vindictus) {
            return 232
        } else if (MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 176
        }

        throw new Error(`Lump object Displacement does not exist in map type ${mapType} or has not been implemented.`)
    }

    /// <summary>
    /// Factory method to parse a <c>byte</c> array into a <see cref="Lump{Displacement}"/>.
    /// </summary>
    /// <param name="data">The data to parse.</param>
    /// <param name="bsp">The <see cref="BSP"/> this lump came from.</param>
    /// <param name="lumpInfo">The <see cref="LumpInfo"/> associated with this lump.</param>
    /// <returns>A <see cref="Lump{Displacement}"/>.</returns>

/// <returns>Index for this lump, or -1 if the format doesn't have this lump.</returns>
    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Source)) {
            return 26
        }

        return -1
    }

/// <summary>
/// Gets the length of this struct's data for the given <paramref name="mapType"/> and <paramref name="lumpVersion"/>.
/// </summary>
/// <param name="mapType">The <see cref="LibBSP.MapType"/> of the BSP.</param>
/// <param name="lumpVersion">The version number for the lump.</param>
/// <returns>The length, in <c>byte</c>s, of this struct.</returns>

    protected ctorData(data: Uint8Array, parent: ILump) {
        super.ctorData(data, parent)

        this._neighbors = []
        this._cornerNeighbors = []

        let neighborStructLength = DisplacementNeighbor.GetStructLength(this.mapType, this.lumpVersion)
        for (let i = 0; i < 4; ++i) {
            this._neighbors[i] = new DisplacementNeighbor(null, this, 48 + (neighborStructLength * i))
        }
        let cornerNeighborStructLength = DisplacementCornerNeighbor.GetStructLength(this.mapType, this.lumpVersion)
        for (let i = 0; i < 4; ++i) {
            this._cornerNeighbors[i] = new DisplacementCornerNeighbor(null, this, 48 + (neighborStructLength * 4) + (cornerNeighborStructLength * i))
        }
    }

/// <summary>
/// Gets the index for this lump in the BSP file for a specific map format.
/// </summary>
/// <param name="type">The map type.</param>
    protected ctorCopy(source: Displacement, parent: ILump) {
        if (parent?.bsp) {
            if (source.parent != null && source.parent.bsp != null && source.parent.bsp.mapType == parent.bsp.mapType && source.lumpVersion == parent.lumpInfo.version) {
                this._data = new Uint8Array(source._data)
                return
            } else {
                this._data = new Uint8Array(Displacement.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent != null && source.parent.bsp != null) {
                this._data = new Uint8Array(Displacement.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this._data = new Uint8Array(Displacement.GetStructLength(MapType.Undefined, 0))
            }
        }

        this.startPosition = source.startPosition
        this.firstVertexIndex = source.firstVertexIndex
        this.firstTriangleIndex = source.firstTriangleIndex
        this.power = source.power
        this.minimumTesselation = source.minimumTesselation
        this.smoothingAngle = source.smoothingAngle
        this.contents = source.contents
        this.faceIndex = source.faceIndex
        this.lightmapAlphaStart = source.lightmapAlphaStart
        this.lightmapSamplePositionStart = source.lightmapSamplePositionStart

        let neighborStructLength = DisplacementNeighbor.GetStructLength(this.mapType, this.lumpVersion)
        for (let i = 0; i < this._neighbors.length; ++i) {
            this._neighbors[i] = new DisplacementNeighbor(source._neighbors[i], this, 48 + (neighborStructLength * i))
        }
        let cornerNeighborStructLength = DisplacementCornerNeighbor.GetStructLength(this.mapType, this.lumpVersion)
        for (let i = 0; i < this._cornerNeighbors.length; ++i) {
            this._cornerNeighbors[i] = new DisplacementCornerNeighbor(source._cornerNeighbors[i], this, 48 + (neighborStructLength * this.neighbors.length) + (cornerNeighborStructLength * i))
        }
        this.allowedVertices = source.allowedVertices
    }

}

/// <summary>
/// Struct providing access to the fields in a <see cref="Displacement"/>'s neighbor data.
/// </summary>
export class DisplacementNeighbor {

    /// <summary>
    /// The <see cref="ILumpObject"/> this <see cref="DisplacementNeighbor"/> is a part of.
    /// </summary>
    public parent: ILumpObject<unknown>

    /// <summary>
    /// The offset within the <see cref="parent"/> where this <see cref="DisplacementNeighbor"/> starts from.
    /// </summary>
    private offset: int

    /// <summary>
    /// The <see cref="DisplacementSubNeighbor"/>s in this <see cref="DisplacementNeighbor"/>.

    /// </param>
    constructor(source: DisplacementNeighbor = null, parent: ILumpObject<unknown>, offset: int) {
        this.parent = parent
        this.offset = offset
        if (source) {
            this._subneighbors = [
                new DisplacementSubNeighbor(source.subneighbors[0], parent, this.offset),
                new DisplacementSubNeighbor(source.subneighbors[1], parent, this.offset + DisplacementNeighbor.GetStructLength(parent.mapType, parent.lumpVersion)),
            ]
        } else {
            this._subneighbors = [
                new DisplacementSubNeighbor(null, parent, offset),
                new DisplacementSubNeighbor(null, parent, offset + DisplacementNeighbor.GetStructLength(parent.mapType, parent.lumpVersion)),
            ]
        }
    }

    /// </summary>
    private _subneighbors: DisplacementSubNeighbor[]

    /// <summary>
    /// Constructs a new <see cref="DisplacementNeighbor"/> using the <paramref name="parent"/>'s 
    /// </summary>
    /// <param name="parent">The parent <see cref="ILumpObject"/> for this <see cref="DisplacementNeighbor"/>.</param>
    /// <param name="offset">
    /// The offset within <paramref name="parent"/>'s <see cref="ILumpObject.Data"/> where this
    /// <see cref="DisplacementNeighbor"/>'s data starts.

    public get subneighbors(): DisplacementSubNeighbor[] {
        return this._subneighbors
    }

    /// <summary>
    /// Gets the length of this struct's data for the given <paramref name="mapType"/> and <paramref name="lumpVersion"/>.
    /// </summary>
    /// <param name="mapType">The <see cref="LibBSP.MapType"/> of the BSP.</param>
    /// <param name="lumpVersion">The version number for the lump.</param>

    /// <returns>The length, in <c>byte</c>s, of this struct.</returns>
    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        return 2 * DisplacementSubNeighbor.GetStructLength(mapType, lumpVersion)
    }
}

/// <summary>
/// Struct providing access to the fields in a <see cref="Displacement"/>'s subneighbor data.
/// </summary>
export class DisplacementSubNeighbor {

    /// <summary>
    /// The <see cref="ILumpObject"/> this <see cref="DisplacementSubNeighbor"/> is a part of.
    /// </summary>
    public parent: ILumpObject<unknown>

    /// <summary>
    /// The offset within the <see cref="parent"/> where this <see cref="DisplacementSubNeighbor"/> starts from.
    /// </summary>
    public offset: int

    /// <summary>
    /// The index of the neighboring <see cref="Displacement"/>.

    /// </param>
    constructor(source: DisplacementSubNeighbor = null, parent: ILumpObject<unknown>, offset: int) {
        this.parent = parent
        this.offset = offset

        if (source) {
            this.neighborIndex = source.neighborIndex
            this.orientation = source.orientation
            this.span = source.span
            this.neighborSpan = source.neighborSpan
        }
    }

    /// </summary>
    public get neighborIndex(): int {
        if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            const view = new DataView(this.parent.data.buffer)
            view.getInt16(this.offset)
        }

        return -1
    }

    /// <summary>
    /// The orientation of the neighboring <see cref="Displacement"/>.

    public set neighborIndex(value: int) {
        if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            const view = new DataView(this.parent.data.buffer)
            view.setInt16(this.offset, value)
        }
    }

    /// </summary>
    public get orientation(): int {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            return view.getInt16(this.offset + 2)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            return this.parent.data[this.offset + 2]
        }

        return -1
    }

    /// <summary>
    /// The span of the neighboring <see cref="Displacement"/>.

    public set orientation(value: int) {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            view.setInt16(this.offset + 2, value)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            this.parent.data[this.offset + 2] = value
        }
    }

    /// </summary>
    public get span(): int {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            return view.getInt16(this.offset + 4)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            return this.parent.data[this.offset + 3]
        }

        return -1
    }

    /// <summary>
    /// The neighbor span of the neighboring <see cref="Displacement"/>.

    public set span(value: int) {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            view.setInt16(this.offset + 4, value)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            this.parent.data[this.offset + 3] = value
        }
    }

    /// </summary>
    public get neighborSpan(): int {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            return view.getInt16(this.offset + 6)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            return this.parent.data[this.offset + 4]
        }

        return -1
    }

    /// <summary>
    /// Constructs a new <see cref="DisplacementSubNeighbor"/>
    /// </summary>
    /// <param name="parent">The parent <see cref="ILumpObject"/> for this <see cref="DisplacementNeighbor"/>.</param>
    /// <param name="offset">
    /// The offset within <paramref name="parent"/>'s <see cref="ILumpObject.Data"/> where this
    /// <see cref="DisplacementSubNeighbor"/>'s data starts.

    public set neighborSpan(value: int) {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            view.setInt16(this.offset + 6, value)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            this.parent.data[this.offset + 4] = value
        }
    }

    /// <summary>
    /// Gets the length of this struct's data for the given <paramref name="mapType"/> and <paramref name="lumpVersion"/>.
    /// </summary>
    /// <param name="mapType">The <see cref="LibBSP.MapType"/> of the BSP.</param>
    /// <param name="lumpVersion">The version number for the lump.</param>
    /// <returns>The length, in <c>byte</c>s, of this struct.</returns>

    /// <exception cref="ArgumentException">This struct is not valid or is not implemented for the given <paramref name="mapType"/> and <paramref name="lumpVersion"/>.</exception>
    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (mapType == MapType.Vindictus) {
            return 8
        } else if (MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 6
        }

        throw new Error(`Object DisplacementSubNeighbor does not exist in map type ${mapType} or has not been implemented.`)
    }


}

/// <summary>
/// Struct providing access to the fields in a <see cref="Displacement"/>'s corner neighbor data.
/// </summary>
export class DisplacementCornerNeighbor {

    /// <summary>
    /// The <see cref="ILumpObject"/> this <see cref="DisplacementCornerNeighbor"/> is a part of.
    /// </summary>
    public parent: ILumpObject<unknown>

    /// <summary>
    /// The offset within the <see cref="parent"/> where this <see cref="DisplacementCornerNeighbor"/> starts from.
    /// </summary>
    public offset: int

    /// <summary>
    /// The indices of the neighboring <see cref="Displacement"/>s.

    constructor(source: DisplacementCornerNeighbor = null, parent: ILumpObject<unknown>, offset: number) {
        this.parent = parent
        this.offset = offset

        if (source) {
            this.neighborIndices = source.neighborIndices
            this.numNeighbors = source.numNeighbors
        }
    }

    /// </summary>
    public get neighborIndices(): Int32Array {
        const neighborIndices = new Int32Array(10)

        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            for (let i = 0; i < 4; ++i) {
                neighborIndices[i] = view.getInt32(this.offset + i * 4)
            }
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            const view = new DataView(this.parent.data.buffer)
            for (let i = 0; i < 4; ++i) {
                neighborIndices[i] = view.getInt16(this.offset + i * 2)
            }
        }

        return neighborIndices
    }

    /// <summary>
    /// The amount of neighboring <see cref="Displacement"/>s.

    public set neighborIndices(value: Int32Array) {
        if (value.length != 4) {
            throw new Error('NeighborIndices array must have 4 elements.')
        }

        if (this.parent.mapType == MapType.Vindictus) {
            this.parent.data.set(value, this.offset)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            const view = new DataView(this.parent.data.buffer)
            for (let i = 0; i < value.length; ++i) {
                view.setInt16(this.offset, value[i])
            }
        }
    }

    /// </summary>
    public get numNeighbors(): int {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            return view.getInt32(this.offset + 16)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            return this.parent.data[this.offset + 8]
        }

        return -1
    }

    /// <summary>
    /// Constructs a new <see cref="DisplacementCornerNeighbor"/>
    /// </summary>
    /// <param name="parent">The parent <see cref="ILumpObject"/> for this <see cref="DisplacementCornerNeighbor"/>.</param>
    /// <param name="offset">
    /// The offset within <paramref name="parent"/>'s <see cref="ILumpObject.Data"/> where this
    /// <see cref="DisplacementCornerNeighbor"/>'s data starts.
    /// </param>

    public set numNeighbors(value: int) {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            view.setInt32(this.offset + 16, value)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            this.parent.data[this.offset + 8] = value
        }
    }

    /// <summary>
    /// Gets the length of this struct's data for the given <paramref name="mapType"/> and <paramref name="lumpVersion"/>.
    /// </summary>
    /// <param name="mapType">The <see cref="LibBSP.MapType"/> of the BSP.</param>
    /// <param name="lumpVersion">The version number for the lump.</param>
    /// <returns>The length, in <c>byte</c>s, of this struct.</returns>

    /// <exception cref="ArgumentException">This struct is not valid or is not implemented for the given <paramref name="mapType"/> and <paramref name="lumpVersion"/>.</exception>
    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (mapType == MapType.Vindictus) {
            return 20
        } else if (MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 10
        }

        throw new Error(`Object DisplacementCornerNeighbor does not exist in map type ${mapType} or has not been implemented.`)
    }
}