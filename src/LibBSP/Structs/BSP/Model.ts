import {ILumpObject} from '../Common/ILumpObject'
import {BSP, LumpInfo, MapType} from './BSP'
import {int} from '../../../utils/number'
import {Leaf} from './Leaf'
import {Brush} from './Brush'
import {Face} from './Face'
import {Vector3} from '../../Util/Vector'
import {Vector3Extensions} from '../../Extensions/Vector3Extensions'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'
import {Node} from './Node'

export class Model extends ILumpObject<Model> {
    public get headNode(): Node {
        return this._parent.bsp.nodes.get(this.headNodeIndex)
    }

    public get headNodeIndex(): int {
        if (this.mapType == MapType.DMoMaM) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(40)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(36)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(24)
        }

        return -1
    }

    public set headNodeIndex(value: int) {
        if (this.mapType == MapType.DMoMaM) {
            const view = new DataView(this.data.buffer)
            view.setInt32(40, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, value)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(24, value)
        }
    }

    public get headClipNode1Index(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(40)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(28)
        }

        return -1
    }

    public set headClipNode1Index(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(40, value)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(28, value)
        }
    }

    public get headClipNode2Index(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(44)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(32)
        }

        return -1
    }

    public set headClipNode2Index(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(44, value)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(32, value)
        }
    }

    public get headClipNode3Index(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(48)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(36)
        }

        return -1
    }

    public set headClipNode3Index(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(48, value)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, value)
        }
    }

    public get leaves(): Leaf[] {
        const arr = []
        for (let i = 0; i < this.numLeaves; ++i) {
            arr.push(this._parent.bsp.leaves.get(this.firstLeafIndex + i))
        }
        return arr
    }

    public get firstLeafIndex(): int {
        if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(40)
        }

        return -1
    }

    public set firstLeafIndex(value: int) {
        if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(40, value)
        }
    }

    public get numLeaves(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(52)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(44)
        }

        return -1
    }

    public set numLeaves(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(52, value)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(44, value)
        }
    }

    public get brushes(): Brush[] {
        const arr = []
        for (let i = 0; i < this.numBrushes; ++i) {
            arr.push(this._parent.bsp.brushes.get(this.firstBrushIndex + i))
        }
        return arr
    }

    public get firstBrushIndex(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(40)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(32)
        }

        return -1
    }

    public set firstBrushIndex(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(40, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(32, value)
        }
    }

    public get numBrushes(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(44)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(36)
        }

        return -1
    }

    public set numBrushes(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(44, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, value)
        }
    }

    public get faces(): Face[] {
        const arr = []
        for (let i = 0; i < this.numFaces; ++i) {
            arr.push(this._parent.bsp.faces.get(this.firstFaceIndex + i))
        }
        return arr
    }

    public get firstFaceIndex(): int {
        if (this.mapType == MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(24)
        } else if (this.mapType == MapType.DMoMaM) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(44)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(48)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(56)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(40)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Titanfall) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(24)
        }

        return -1
    }

    public set firstFaceIndex(value: int) {
        if (this.mapType == MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            view.setInt16(24, value)
        } else if (this.mapType == MapType.DMoMaM) {
            const view = new DataView(this.data.buffer)
            view.setInt32(44, value)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(48, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(56, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(40, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Titanfall) {
            const view = new DataView(this.data.buffer)
            view.setInt32(24, value)
        }
    }

    public get numFaces(): int {
        if (this.mapType == MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(28)
        } else if (this.mapType == MapType.DMoMaM) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(48)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(52)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(60)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(44)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Titanfall) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(28)
        }

        return -1
    }

    public set numFaces(value: int) {
        if (this.mapType == MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            view.setInt16(28, value)
        } else if (this.mapType == MapType.DMoMaM) {
            const view = new DataView(this.data.buffer)
            view.setInt32(48, value)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(52, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(60, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(44, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Titanfall) {
            const view = new DataView(this.data.buffer)
            view.setInt32(28, value)
        }
    }

    public get patchIndices(): int[] {
        const arr = []
        for (let i = 0; i < this.numPatchIndices; ++i) {
            arr.push(Math.trunc(Number(this._parent.bsp.patchIndices.get(this.firstPatchIndicesIndex + i))))
        }
        return arr
    }

    public get firstPatchIndicesIndex(): int {
        if (this.mapType == MapType.CoD
            || this.mapType == MapType.CoDDemo) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(32)
        }

        return -1
    }

    public set firstPatchIndicesIndex(value: int) {
        if (this.mapType == MapType.CoD
            || this.mapType == MapType.CoDDemo) {
            const view = new DataView(this.data.buffer)
            view.setInt32(32, value)
        }
    }

    public get numPatchIndices(): int {
        if (this.mapType == MapType.CoD
            || this.mapType == MapType.CoDDemo) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(36)
        }

        return -1
    }

    public set numPatchIndices(value: int) {
        if (this.mapType == MapType.CoD
            || this.mapType == MapType.CoDDemo) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, value)
        }
    }

    public get minimums(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Nightfire
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType == MapType.Titanfall) {
            return Vector3Extensions.ToVector3(this.data)
        }

        return new Vector3(0, 0, 0)
    }

    public set minimums(value: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Nightfire
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType == MapType.Titanfall) {
            value.getBytes(this.data, 0)
        }
    }

    public get maximums(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Nightfire
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType == MapType.Titanfall) {
            return Vector3Extensions.ToVector3(this.data, 12)
        }

        return new Vector3(0, 0, 0)
    }

    public set maximums(value: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Nightfire
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType == MapType.Titanfall) {
            value.getBytes(this.data, 12)
        }
    }

    public get origin(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector3Extensions.ToVector3(this.data, 24)
        }

        return new Vector3(0, 0, 0)
    }

    public set origin(value: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            value.getBytes(this.data, 24)
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Model> {
        if (data == null) {
            throw new Error('ArgumentNullException')
        }

        const l = new Lump<Model>(Model, null, bsp, lumpInfo)
        l.fromData(data, Model.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }


    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (mapType == MapType.DMoMaM) {
            return 52
        } else if (mapType == MapType.Titanfall) {
            return 32
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(mapType, MapType.CoD)
            || MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 48
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake)) {
            return 64
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake3)) {
            return 40
        } else if (mapType == MapType.Nightfire) {
            return 56
        }

        throw new Error(`Lump object Model does not exist in map type ${mapType} or has not been implemented.`)
    }


    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Quake)
            || MapType.IsSubtypeOf(type, MapType.Source)
            || type == MapType.Nightfire
            || type == MapType.Titanfall
            || type == MapType.MOHAADemo) {
            return 14
        } else if (MapType.IsSubtypeOf(type, MapType.MOHAA)
            || MapType.IsSubtypeOf(type, MapType.FAKK2)
            || MapType.IsSubtypeOf(type, MapType.Quake2)) {
            return 13
        } else if (MapType.IsSubtypeOf(type, MapType.STEF2)) {
            return 15
        } else if (type == MapType.CoD
            || type == MapType.CoDDemo) {
            return 27
        } else if (type == MapType.CoD2) {
            return 35
        } else if (type == MapType.CoD4) {
            return 37
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)) {
            return 7
        }

        return -1
    }


    protected ctorCopy(source: Model, parent: ILump) {
        this._parent = parent

        if (parent?.bsp) {
            if (source.parent != null && source.parent.bsp != null && source.parent.bsp.mapType == parent.bsp.mapType && source.lumpVersion == parent.lumpInfo.version) {
                this.data = new Uint8Array(source._data)
                return
            } else {
                this.data = new Uint8Array(Model.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent != null && source.parent.bsp != null) {
                this.data = new Uint8Array(Model.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(Model.GetStructLength(MapType.Undefined, 0))
            }
        }


        this.headNodeIndex = source.headNodeIndex
        this.headClipNode1Index = source.headClipNode1Index
        this.headClipNode2Index = source.headClipNode2Index
        this.headClipNode3Index = source.headClipNode3Index
        this.firstLeafIndex = source.firstLeafIndex
        this.numLeaves = source.numLeaves
        this.firstBrushIndex = source.firstBrushIndex
        this.numBrushes = source.numBrushes
        this.firstFaceIndex = source.firstFaceIndex
        this.numFaces = source.numFaces
        this.firstPatchIndicesIndex = source.firstPatchIndicesIndex
        this.numPatchIndices = source.numPatchIndices
        this.minimums = source.minimums
        this.maximums = source.maximums
        this.origin = source.origin
    }


}