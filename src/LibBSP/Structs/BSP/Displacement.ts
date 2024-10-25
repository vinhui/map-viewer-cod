import {ILumpObject} from '../Common/ILumpObject'
import {Vector3} from '../../Utils/Vector'
import {BSP, LumpInfo, MapType} from './BSP'
import {Vector3Extensions} from '../../Extensions/Vector3Extensions'
import {float, int, ushort} from '../../../utils/number'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'
import {DisplacementVertex} from './DisplacementVertex'
import {Face} from './Face'

export class Displacement extends ILumpObject<Displacement> {
    public get startPosition(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector3Extensions.ToVector3(this.data)
        }

        return new Vector3(0, 0, 0)
    }

    public set startPosition(value: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            value.getBytes(this.data, 0)
        }
    }


    public get vertices(): DisplacementVertex[] {
        const numVertices = this.numVertices
        const arr: DisplacementVertex[] = []
        for (let i = 0; i < numVertices; ++i) {
            arr.push(this._parent.bsp.displacementVertices.get(this.firstVertexIndex + 1))
        }
        return arr
    }

    public get firstVertexIndex(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(12)
        }

        return -1
    }


    public set firstVertexIndex(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(12, value)
        }
    }

    public get triangles(): ushort[] {
        const arr: ushort[] = []
        for (let i = 0; i < this.numTriangles; ++i) {
            arr.push(Number(this._parent.bsp.displacementTriangles.get(this.firstTriangleIndex + 1)))
        }
        return arr
    }


    public get firstTriangleIndex(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(16)
        }

        return -1
    }

    public set firstTriangleIndex(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(16, value)
        }
    }


    public get power(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(20)
        }

        return -1
    }

    public set power(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(20, value)
        }
    }

    public get numVertices(): int {
        const numSideVerts = Math.trunc(Math.pow(2, this.power)) + 1
        return numSideVerts * numSideVerts
    }


    public get numTriangles(): int {
        const side = this.power * this.power
        return 2 * side * side
    }

    public set numTriangles(value: int) {

    }

    public get minimumTesselation(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(24)
        }

        return -1
    }

    public set minimumTesselation(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(24, value)
        }
    }

    public get smoothingAngle(): float {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getFloat32(28)
        }

        return 0
    }

    public set smoothingAngle(value: float) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setFloat32(28, value)
        }
    }

    public get contents(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(32)
        }

        return -1
    }

    public set contents(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(32, value)
        }
    }

    public get face(): Face {
        return this.parent.bsp.faces.get(this.faceIndex)
    }

    public get faceIndex(): int {
        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(36)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(36)
        }

        return -1
    }

    public set faceIndex(value: int) {


        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(36, value)
        }
    }

    public get lightmapAlphaStart(): int {
        const view = new DataView(this.data.buffer)
        return view.getInt32(40)
    }

    public set lightmapAlphaStart(value: int) {
        const view = new DataView(this.data.buffer)
        view.setInt16(40, value)
    }

    public get lightmapSamplePositionStart(): int {
        const view = new DataView(this.data.buffer)
        return view.getInt32(44)
    }

    public set lightmapSamplePositionStart(value: int) {
        const view = new DataView(this.data.buffer)
        view.setInt16(44, value)
    }

    private _neighbors: DisplacementNeighbor[]
    public get neighbors(): DisplacementNeighbor[] {
        return this._neighbors
    }

    private _cornerNeighbors: DisplacementCornerNeighbor[]
    public get cornerNeighbors(): DisplacementCornerNeighbor[] {
        return this._cornerNeighbors
    }

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
            allowedVertices.set(this.data, offset)
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
            this.data.set(value, offset)
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Displacement> {
        if (data == null) {
            throw new Error('ArgumentNullException')
        }

        const l = new Lump<Displacement>(Displacement, null, bsp, lumpInfo)
        l.fromData(data, Displacement.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }

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


    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Source)) {
            return 26
        }

        return -1
    }


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

    protected ctorCopy(source: Displacement, parent: ILump) {
        if (parent?.bsp) {
            if (source.parent != null && source.parent.bsp != null && source.parent.bsp.mapType == parent.bsp.mapType && source.lumpVersion == parent.lumpInfo.version) {
                this.data = new Uint8Array(source._data)
                return
            } else {
                this.data = new Uint8Array(Displacement.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent != null && source.parent.bsp != null) {
                this.data = new Uint8Array(Displacement.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(Displacement.GetStructLength(MapType.Undefined, 0))
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

export class DisplacementNeighbor {

    public parent: ILumpObject<unknown>

    private offset: int


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

    private _subneighbors: DisplacementSubNeighbor[]


    public get subneighbors(): DisplacementSubNeighbor[] {
        return this._subneighbors
    }


    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        return 2 * DisplacementSubNeighbor.GetStructLength(mapType, lumpVersion)
    }
}

export class DisplacementSubNeighbor {

    public parent: ILumpObject<unknown>

    public offset: int


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

    public get neighborIndex(): int {
        if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            const view = new DataView(this.parent.data.buffer)
            view.getInt16(this.offset)
        }

        return -1
    }


    public set neighborIndex(value: int) {
        if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            const view = new DataView(this.parent.data.buffer)
            view.setInt16(this.offset, value)
        }
    }

    public get orientation(): int {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            return view.getInt16(this.offset + 2)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            return this.parent.data[this.offset + 2]
        }

        return -1
    }


    public set orientation(value: int) {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            view.setInt16(this.offset + 2, value)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            this.parent.data[this.offset + 2] = value
        }
    }

    public get span(): int {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            return view.getInt16(this.offset + 4)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            return this.parent.data[this.offset + 3]
        }

        return -1
    }


    public set span(value: int) {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            view.setInt16(this.offset + 4, value)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            this.parent.data[this.offset + 3] = value
        }
    }

    public get neighborSpan(): int {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            return view.getInt16(this.offset + 6)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            return this.parent.data[this.offset + 4]
        }

        return -1
    }


    public set neighborSpan(value: int) {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            view.setInt16(this.offset + 6, value)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            this.parent.data[this.offset + 4] = value
        }
    }


    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (mapType == MapType.Vindictus) {
            return 8
        } else if (MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 6
        }

        throw new Error(`Object DisplacementSubNeighbor does not exist in map type ${mapType} or has not been implemented.`)
    }


}

export class DisplacementCornerNeighbor {

    public parent: ILumpObject<unknown>

    public offset: int


    constructor(source: DisplacementCornerNeighbor = null, parent: ILumpObject<unknown>, offset: number) {
        this.parent = parent
        this.offset = offset

        if (source) {
            this.neighborIndices = source.neighborIndices
            this.numNeighbors = source.numNeighbors
        }
    }

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

    public get numNeighbors(): int {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            return view.getInt32(this.offset + 16)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            return this.parent.data[this.offset + 8]
        }

        return -1
    }


    public set numNeighbors(value: int) {
        if (this.parent.mapType == MapType.Vindictus) {
            const view = new DataView(this.parent.data.buffer)
            view.setInt32(this.offset + 16, value)
        } else if (MapType.IsSubtypeOf(this.parent.mapType, MapType.Source)) {
            this.parent.data[this.offset + 8] = value
        }
    }


    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (mapType == MapType.Vindictus) {
            return 20
        } else if (MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 10
        }

        throw new Error(`Object DisplacementCornerNeighbor does not exist in map type ${mapType} or has not been implemented.`)
    }
}