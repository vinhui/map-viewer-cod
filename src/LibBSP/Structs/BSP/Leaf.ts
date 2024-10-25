import {ILumpObject} from '../Common/ILumpObject'
import {byte, int} from '../../../utils/number'
import {BSP, LumpInfo, MapType} from './BSP'
import {Vector3} from '../../Utils/Vector'
import {Vector3Extensions} from '../../Extensions/Vector3Extensions'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'

export class Leaf extends ILumpObject<Leaf> {
    public get contents(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(0)
        }

        return -1
    }

    public set contents(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(0, value)
        }
    }


    public get visibility(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || this.mapType == MapType.Nightfire
            || this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(4)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(4)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(0)
        }

        return -1
    }

    public set visibility(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || this.mapType == MapType.Nightfire
            || this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(4, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(4, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(0, value)
        }
    }


    public get area(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(6)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && this.mapType != MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(4)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source) && this.mapType != MapType.Vindictus) {
            return this.data[6]
        }

        return -1
    }


    public set area(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(6, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && this.mapType != MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            view.setInt32(4, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source) && this.mapType != MapType.Vindictus) {
            this.data[6] = value
        }
    }

    public get flags(): int {
        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(8)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return this.data[7]
        }

        return -1
    }

    public set flags(value: int) {
        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(8, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            this.data[7] = value
        }
    }


    public get minimums(): Vector3 {
        if (this.mapType == MapType.SoF) {
            const view = new DataView(this.data.buffer)
            return new Vector3(view.getInt16(10), view.getInt16(12), view.getInt16(14))
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return new Vector3(view.getInt32(12), view.getInt32(16), view.getInt32(20))
        } else if (this.mapType == MapType.Nightfire) {
            return Vector3Extensions.ToVector3(this.data, 8)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return new Vector3(view.getInt16(8), view.getInt16(10), view.getInt16(12))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return new Vector3(view.getInt32(8), view.getInt32(12), view.getInt32(16))
        }

        return new Vector3(0, 0, 0)
    }

    public set minimums(value: Vector3) {
        if (this.mapType == MapType.SoF) {
            const view = new DataView(this.data.buffer)
            view.setInt16(10, Math.trunc(value.x))
            view.setInt16(12, Math.trunc(value.y))
            view.setInt16(14, Math.trunc(value.z))
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(12, Math.trunc(value.x))
            view.setInt32(16, Math.trunc(value.y))
            view.setInt32(20, Math.trunc(value.z))
        } else if (this.mapType == MapType.Nightfire) {
            value.getBytes(this.data, 8)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(8, Math.trunc(value.x))
            view.setInt16(10, Math.trunc(value.y))
            view.setInt16(12, Math.trunc(value.z))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(8, Math.trunc(value.x))
            view.setInt16(12, Math.trunc(value.y))
            view.setInt16(16, Math.trunc(value.z))
        }
    }

    public get maximums(): Vector3 {
        if (this.mapType == MapType.SoF) {
            const view = new DataView(this.data.buffer)
            return new Vector3(view.getInt16(16), view.getInt16(18), view.getInt16(20))
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return new Vector3(view.getInt32(24), view.getInt32(28), view.getInt32(32))
        } else if (this.mapType == MapType.Nightfire) {
            return Vector3Extensions.ToVector3(this.data, 20)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return new Vector3(view.getInt16(14), view.getInt16(16), view.getInt16(18))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return new Vector3(view.getInt32(20), view.getInt32(24), view.getInt32(28))
        }

        return new Vector3(0, 0, 0)
    }


    public set maximums(value: Vector3) {
        if (this.mapType == MapType.SoF) {
            const view = new DataView(this.data.buffer)
            view.setInt16(16, Math.trunc(value.x))
            view.setInt16(18, Math.trunc(value.y))
            view.setInt16(20, Math.trunc(value.z))
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(24, Math.trunc(value.x))
            view.setInt32(28, Math.trunc(value.y))
            view.setInt32(32, Math.trunc(value.z))
        } else if (this.mapType == MapType.Nightfire) {
            value.getBytes(this.data, 20)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(14, Math.trunc(value.x))
            view.setInt16(16, Math.trunc(value.y))
            view.setInt16(18, Math.trunc(value.z))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(20, Math.trunc(value.x))
            view.setInt16(24, Math.trunc(value.y))
            view.setInt16(28, Math.trunc(value.z))
        }
    }


    public get markBrushes(): int[] {
        const arr = []
        for (let i = 0; i < this.numMarkBrushIndices; ++i) {
            arr.push(this._parent.bsp.leafBrushes.get(this.firstMarkBrushIndex + i))
        }
        return arr
    }

    public get firstMarkBrushIndex(): int {
        if (this.mapType == MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(12)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(16)
        } else if (this.mapType == MapType.SoF) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(26)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(44)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(24)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(40)
        }

        return -1
    }

    public set firstMarkBrushIndex(value: int) {
        if (this.mapType == MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            view.setInt32(12, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(16, value)
        } else if (this.mapType == MapType.SoF) {
            const view = new DataView(this.data.buffer)
            view.setUint16(26, value)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(44, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(24, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(40, value)
        }
    }


    public get numMarkBrushIndices(): int {
        if (this.mapType == MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(16)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(20)
        } else if (this.mapType == MapType.SoF) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(28)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(48)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(44)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(26)
        }

        return -1
    }

    public set numMarkBrushIndices(value: int) {
        if (this.mapType == MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            view.setInt32(16, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(20, value)
        } else if (this.mapType == MapType.SoF) {
            const view = new DataView(this.data.buffer)
            view.setUint16(28, value)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(48, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(44, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setUint16(26, value)
        }
    }

    public get markFaces(): int[] {
        const arr = []
        for (let i = 0; i < this.numMarkFaceIndices; ++i
        ) {
            arr.push(this._parent.bsp.leafFaces.get(this.firstMarkFaceIndex + i))
        }
        return arr
    }


    public get firstMarkFaceIndex(): int {
        if (this.mapType == MapType.SoF) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(22)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(36)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(32)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(20)
        }

        return -1
    }

    public set firstMarkFaceIndex(value: int) {
        if (this.mapType == MapType.SoF) {
            const view = new DataView(this.data.buffer)
            view.setUint16(22, value)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(32, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setUint16(20, value)
        }
    }


    public get numMarkFaceIndices(): int {
        if (this.mapType == MapType.SoF) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(24)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(40)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(36)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(22)
        }

        return -1
    }

    public set numMarkFaceIndices(value: int) {
        if (this.mapType == MapType.SoF) {
            const view = new DataView(this.data.buffer)
            view.setUint16(24, value)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(40, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setUint16(22, value)
        }
    }


    public get waterSoundLevel(): byte {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            return this.data[24]
        }

        return 0
    }

    public set waterSoundLevel(value: byte) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            this.data[24] = value
        }
    }


    public get skySoundLevel(): byte {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            return this.data[25]
        }

        return 0
    }

    public set skySoundLevel(value: byte) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            this.data[25] = value
        }
    }


    public get slimeSoundLevel(): byte {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            return this.data[26]
        }

        return 0
    }


    public set slimeSoundLevel(value: byte) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            this.data[26] = value
        }
    }

    public get lavaSoundLevel(): byte {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            return this.data[27]
        }

        return 0
    }

    public set lavaSoundLevel(value: byte) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            this.data[27] = value
        }
    }


    public get leafStaticModels(): int[] {
        const arr = []
        for (let i = 0; i < this.numLeafStaticModelIndices; ++i
        ) {
            arr.push(this._parent.bsp.leafStaticModels.get(this.firstLeafStaticModelIndex + i))
        }
        return arr
    }

    public get firstLeafStaticModelIndex(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(56)
        }

        return -1
    }

    public set firstLeafStaticModelIndex(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(56, value)
        }
    }


    public get numLeafStaticModelIndices(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(60)
        }

        return -1
    }


    public set numLeafStaticModelIndices(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(60, value)
        }
    }

    public get patchIndices(): int[] {
        const arr = []
        for (let i = 0; i < this.numPatchIndices; ++i
        ) {
            arr.push(this._parent.bsp.leafPatches.get(this.firstPatchIndicesIndex + i))
        }
        return arr
    }

    public get firstPatchIndicesIndex(): int {
        if (this.mapType == MapType.CoD
            || this.mapType == MapType.CoDDemo
            || this.mapType == MapType.CoD2) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(8)
        }

        return -1
    }


    public set firstPatchIndicesIndex(value: int) {
        if (this.mapType == MapType.CoD
            || this.mapType == MapType.CoDDemo
            || this.mapType == MapType.CoD2) {
            const view = new DataView(this.data.buffer)
            view.setInt32(8, value)
        }
    }

    public get numPatchIndices(): int {
        if (this.mapType == MapType.CoD
            || this.mapType == MapType.CoDDemo
            || this.mapType == MapType.CoD2) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(12)
        }

        return -1
    }

    public set numPatchIndices(value: int) {
        if (this.mapType == MapType.CoD
            || this.mapType == MapType.CoDDemo
            || this.mapType == MapType.CoD2) {
            const view = new DataView(this.data.buffer)
            view.setInt32(12, value)
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Leaf> {
        if (data == null) {
            throw new Error('ArgumentNullException')
        }

        const l = new Lump<Leaf>(Leaf, null, bsp, lumpInfo)
        l.fromData(data, Leaf.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }


    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (mapType == MapType.CoD4) {
            return 24
        } else if (MapType.IsSubtypeOf(mapType, MapType.CoD)) {
            return 36
        } else if (MapType.IsSubtypeOf(mapType, MapType.MOHAA)) {
            return 64
        } else if (mapType == MapType.Source19
            || mapType == MapType.Vindictus) {
            return 56
        } else if (MapType.IsSubtypeOf(mapType, MapType.Source)
            || mapType == MapType.SoF
            || mapType == MapType.Daikatana) {
            return 32
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake)
            || MapType.IsSubtypeOf(mapType, MapType.Quake2)) {
            return 28
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake3)
            || mapType == MapType.Nightfire) {
            return 48
        }

        throw new Error(`Lump object Leaf does not exist in map type ${mapType} or has not been implemented.`)
    }


    public static GetIndexForLump(type: MapType): int {
        if (type == MapType.Nightfire) {
            return 11
        } else if (type == MapType.CoD
            || type == MapType.CoDDemo) {
            return 21
        } else if (type == MapType.CoD2) {
            return 26
        } else if (type == MapType.CoD4) {
            return 28
        } else if (MapType.IsSubtypeOf(type, MapType.Quake2)
            || MapType.IsSubtypeOf(type, MapType.MOHAA)
            || MapType.IsSubtypeOf(type, MapType.FAKK2)) {
            return 8
        } else if (MapType.IsSubtypeOf(type, MapType.Quake)
            || MapType.IsSubtypeOf(type, MapType.Source)
            || MapType.IsSubtypeOf(type, MapType.STEF2)) {
            return 10
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)) {
            return 4
        }

        return -1
    }


    protected ctorCopy(source: Leaf, parent: ILump) {
        this._parent = parent
        if (parent?.bsp) {
            if (source.parent != null && source.parent.bsp != null && source.parent.bsp.mapType == parent.bsp.mapType && source.lumpVersion == parent.lumpInfo.version) {
                this.data = new Uint8Array(source._data)
                return
            } else {
                this.data = new Uint8Array(Leaf.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent != null && source.parent.bsp != null) {
                this.data = new Uint8Array(Leaf.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(Leaf.GetStructLength(MapType.Undefined, 0))
            }
        }

        this.contents = source.contents
        this.visibility = source.visibility
        this.area = source.area
        this.flags = source.flags
        this.minimums = source.minimums
        this.maximums = source.maximums
        this.firstMarkBrushIndex = source.firstMarkBrushIndex
        this.numMarkBrushIndices = source.numMarkBrushIndices
        this.firstMarkFaceIndex = source.firstMarkFaceIndex
        this.numMarkFaceIndices = source.numMarkFaceIndices
        this.waterSoundLevel = source.waterSoundLevel
        this.skySoundLevel = source.skySoundLevel
        this.slimeSoundLevel = source.slimeSoundLevel
        this.lavaSoundLevel = source.lavaSoundLevel
        this.firstLeafStaticModelIndex = source.firstLeafStaticModelIndex
        this.numLeafStaticModelIndices = source.numLeafStaticModelIndices
        this.firstPatchIndicesIndex = source.firstPatchIndicesIndex
        this.numPatchIndices = source.numPatchIndices
    }

}