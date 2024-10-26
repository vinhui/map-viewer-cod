import {ILumpObject} from '../Common/ILumpObject'
import {Vertex} from '../Common/Vertex'
import {int} from '../../../utils/number'
import {BSP, LumpInfo, MapType} from './BSP'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'

export class Edge extends ILumpObject<Edge> {
    public get firstVertex(): Vertex {
        return this._parent.bsp.vertices.get(this.firstVertexIndex)
    }

    public get firstVertexIndex(): int {
        if (this.mapType === MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(0, true)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(0, true)
        }

        return -1
    }

    public set firstVertexIndex(value: int) {
        if (this.mapType === MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(0, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setUint16(0, value)
        }
    }

    public get secondVertex(): Vertex {
        return this._parent.bsp.vertices.get(this.secondVertexIndex)
    }

    public get secondVertexIndex(): int {
        if (this.mapType === MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(4, true)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(2, true)
        }

        return -1
    }

    public set secondVertexIndex(value: int) {
        if (this.mapType === MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(4, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setUint16(2, value)
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Edge> {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const l = new Lump<Edge>(Edge, null, bsp, lumpInfo)
        l.fromData(data, Edge.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }


    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (mapType === MapType.Vindictus) {
            return 8
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake)
            || MapType.IsSubtypeOf(mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 4
        }

        throw new Error(`Lump object Edge does not exist in map type ${mapType} or has not been implemented.`)
    }


    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Quake2)) {
            return 11
        } else if (MapType.IsSubtypeOf(type, MapType.Quake)
            || MapType.IsSubtypeOf(type, MapType.Source)) {
            return 12
        }

        return -1
    }


    protected ctorCopy(source: Edge, parent: ILump) {
        this._parent = parent

        if (parent?.bsp) {
            if (source.parent?.bsp && source.parent.bsp.mapType === parent.bsp.mapType && source.lumpVersion === parent.lumpInfo.version) {
                this.data = new Uint8Array(source.data)
                return
            } else {
                this.data = new Uint8Array(Edge.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent?.bsp) {
                this.data = new Uint8Array(Edge.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(Edge.GetStructLength(MapType.Undefined, 0))
            }
        }

        this.firstVertexIndex = source.firstVertexIndex
        this.secondVertexIndex = source.secondVertexIndex
    }
}