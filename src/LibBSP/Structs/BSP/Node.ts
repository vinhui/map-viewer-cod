import {ILumpObject} from '../Common/ILumpObject'
import {Plane} from '../../Util/Plane'
import {int} from '../../../utils/number'
import {BSP, LumpInfo, MapType} from './BSP'
import {Vector3} from '../../Util/Vector'
import {Vector3Extensions} from '../../Extensions/Vector3Extensions'
import {Face} from './Face'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'

export class Node extends ILumpObject<Node> {
    public get plane(): Plane {
        return this._parent.bsp.planes.get(this.planeIndex)
    }

    public get planeIndex(): int {
        const view = new DataView(this.data.buffer)
        return view.getInt32(0)
    }

    public set planeIndex(value: int) {
        const view = new DataView(this.data.buffer)
        view.setInt32(0, value)
    }

    public get child1(): ILumpObject<unknown> {
        if (this.child1Index >= 0) {
            return this._parent.bsp.nodes.get(this.child1Index)
        }
        return this._parent.bsp.leaves.get(~this.child1Index)
    }

    public get child1Index(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(4)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(4)
        }

        return 0
    }

    public set child1Index(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(4, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(4, value)
        }
    }

    public get child2(): ILumpObject<unknown> {
        if (this.child2Index >= 0) {
            return this._parent.bsp.nodes.get(this.child2Index)
        }
        return this._parent.bsp.leaves.get(~this.child2Index)
    }

    public get child2Index(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(6)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(8)
        }

        return 0
    }

    public set child2Index(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(6, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(8, value)
        }
    }

    public get minimums(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return new Vector3(view.getInt16(8), view.getInt16(10), view.getInt16(12))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return new Vector3(view.getInt32(12), view.getInt32(16), view.getInt32(20))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            const view = new DataView(this.data.buffer)
            return new Vector3(view.getInt16(12), view.getInt16(14), view.getInt16(16))
        } else if (this.mapType == MapType.Nightfire) {
            return Vector3Extensions.ToVector3(this.data, 12)
        }

        return new Vector3(0, 0, 0)
    }

    public set minimums(value: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(8, Math.trunc(value.x))
            view.setInt16(10, Math.trunc(value.y))
            view.setInt16(12, Math.trunc(value.z))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt16(12, Math.trunc(value.x))
            view.setInt16(16, Math.trunc(value.y))
            view.setInt16(20, Math.trunc(value.z))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(12, Math.trunc(value.x))
            view.setInt16(14, Math.trunc(value.y))
            view.setInt16(16, Math.trunc(value.z))
        } else if (this.mapType == MapType.Nightfire) {
            value.getBytes(this.data, 12)
        }
    }

    public get maximums(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return new Vector3(view.getInt16(14), view.getInt16(16), view.getInt16(18))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return new Vector3(view.getInt32(24), view.getInt32(28), view.getInt32(32))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            const view = new DataView(this.data.buffer)
            return new Vector3(view.getInt16(18), view.getInt16(20), view.getInt16(22))
        } else if (this.mapType == MapType.Nightfire) {
            return Vector3Extensions.ToVector3(this.data, 24)
        }

        return new Vector3(0, 0, 0)
    }

    public set maximums(value: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(14, Math.trunc(value.x))
            view.setInt16(16, Math.trunc(value.y))
            view.setInt16(18, Math.trunc(value.z))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt16(24, Math.trunc(value.x))
            view.setInt16(28, Math.trunc(value.y))
            view.setInt16(32, Math.trunc(value.z))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(18, Math.trunc(value.x))
            view.setInt16(20, Math.trunc(value.y))
            view.setInt16(22, Math.trunc(value.z))
        } else if (this.mapType == MapType.Nightfire) {
            value.getBytes(this.data, 24)
        }
    }

    public get faces(): Face[] {
        const arr = []
        for (let i = 0; i < this.numFaceIndices; ++i) {
            arr.push(this._parent.bsp.faces.get(this.firstFaceIndex + i))
        }
        return arr
    }

    public get firstFaceIndex(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(20)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(36)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(24)
        }

        return -1
    }

    public set firstFaceIndex(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(20, value)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(24, value)
        }
    }

    public get numFaceIndices(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(22)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(40)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(26)
        }

        return -1
    }

    public set numFaceIndices(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(22, value)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(40, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(26, value)
        }
    }

    public get areaIndex(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source) && this.mapType != MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(28)
        }

        return -1
    }

    public set areaIndex(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source) && this.mapType != MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt16(28, value)
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Node> {
        if (data == null) {
            throw new Error('ArgumentNullException')
        }

        const l = new Lump<Node>(Node, null, bsp, lumpInfo)
        l.fromData(data, Node.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }


    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (MapType.IsSubtypeOf(mapType, MapType.Quake)) {
            return 24
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake2)) {
            return 28
        } else if (mapType == MapType.Vindictus) {
            return 48
        } else if (MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 32
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake3)
            || mapType == MapType.Nightfire) {
            return 36
        }

        throw new Error(`Lump object Node does not exist in map type ${mapType} or has not been implemented.`)
    }


    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Quake2)) {
            return 4
        } else if (MapType.IsSubtypeOf(type, MapType.Quake)) {
            return 5
        } else if (MapType.IsSubtypeOf(type, MapType.Source)) {
            return 5
        } else if (MapType.IsSubtypeOf(type, MapType.FAKK2)
            || MapType.IsSubtypeOf(type, MapType.MOHAA)) {
            return 9
        } else if (MapType.IsSubtypeOf(type, MapType.STEF2)) {
            return 11
        } else if (type == MapType.Nightfire) {
            return 8
        } else if (type == MapType.CoD
            || type == MapType.CoDDemo) {
            return 20
        } else if (type == MapType.CoD2) {
            return 25
        } else if (type == MapType.CoD4) {
            return 27
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)) {
            return 3
        }

        return -1
    }


    protected ctorCopy(source: Node, parent: ILump) {
        this._parent = parent

        if (parent?.bsp) {
            if (source.parent != null && source.parent.bsp != null && source.parent.bsp.mapType == parent.bsp.mapType && source.lumpVersion == parent.lumpInfo.version) {
                this.data = new Uint8Array(source._data)
                return
            } else {
                this.data = new Uint8Array(Node.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent != null && source.parent.bsp != null) {
                this.data = new Uint8Array(Node.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(Node.GetStructLength(MapType.Undefined, 0))
            }
        }


        this.planeIndex = source.planeIndex
        this.child1Index = source.child1Index
        this.child2Index = source.child2Index
        this.minimums = source.minimums
        this.maximums = source.maximums
        this.firstFaceIndex = source.firstFaceIndex
        this.numFaceIndices = source.numFaceIndices
        this.areaIndex = source.areaIndex
    }
}