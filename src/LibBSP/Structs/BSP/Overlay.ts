import {ILumpObject} from '../Common/ILumpObject'
import {int, uint} from '../../../utils/number'
import {BSP, LumpInfo, MapType} from './BSP'
import {TextureInfo} from '../Common/TextureInfo'
import {Vector2, Vector3} from '../../Utils/Vector'
import {Vector2Extensions} from '../../Extensions/Vector2Extensions'
import {Vector3Extensions} from '../../Extensions/Vector3Extensions'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'

export class Overlay extends ILumpObject<Overlay> {
    public static readonly NumOverlayFaces = 64

    public get id(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(0)
        }

        return -1
    }

    public set id(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(0, value)
        }
    }

    public get textureInfo(): TextureInfo {
        return this._parent.bsp.textureInfo.get(this.textureInfoIndex)
    }

    public get textureInfoIndex(): int {
        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(4)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(4)
        }

        return -1
    }

    public set textureInfoIndex(value: int) {
        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt16(4, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(4, value)
        }
    }

    public get faceCountAndRenderOrder(): uint {
        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getUint32(8)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(6)
        }

        return 0
    }

    public set faceCountAndRenderOrder(value: uint) {
        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setUint32(8, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(6, value)
        }
    }

    public get faceCount(): uint {
        return this.faceCountAndRenderOrder & 0x00003FFF
    }

    public set faceCount(value: uint) {
        this.faceCountAndRenderOrder = (this.faceCountAndRenderOrder & 0x0000C000) | value
    }

    public get renderOrder(): uint {
        return this.faceCountAndRenderOrder >> 14
    }

    public set renderOrder(value: uint) {
        this.faceCountAndRenderOrder = (this.faceCountAndRenderOrder & 0x00003FFF) | (value << 14)
    }

    public get faceIndices(): int[] {
        let offset
        if (this.mapType == MapType.Vindictus) {
            offset = 12
        } else {
            offset = 8
        }

        const result = []
        for (let i = 0; i < Overlay.NumOverlayFaces; i++) {
            const view = new DataView(this.data.buffer)
            result[i] = view.getInt32(offset)
            offset += 4
        }

        return result
    }

    public set faceIndices(value: int[]) {
        let offset
        if (this.mapType == MapType.Vindictus) {
            offset = 12
        } else {
            offset = 8
        }

        for (let i = 0; i < value.length && i < Overlay.NumOverlayFaces; i++) {
            const view = new DataView(this.data.buffer)
            view.setInt32(offset, value[i])
            offset += 4
        }
    }

    public get u(): Vector2 {
        if (this.mapType == MapType.Vindictus) {
            return Vector2Extensions.ToVector2(this.data, 268)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector2Extensions.ToVector2(this.data, 264)
        }

        return new Vector2(0, 0)
    }

    public set u(value: Vector2) {
        if (this.mapType == MapType.Vindictus) {
            value.getBytes(this.data, 268)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            value.getBytes(this.data, 264)
        }
    }

    public get v(): Vector2 {
        if (this.mapType == MapType.Vindictus) {
            return Vector2Extensions.ToVector2(this.data, 276)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector2Extensions.ToVector2(this.data, 272)
        }

        return new Vector2(0, 0)
    }

    public set v(value: Vector2) {
        if (this.mapType == MapType.Vindictus) {
            value.getBytes(this.data, 276)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            value.getBytes(this.data, 272)
        }
    }

    public get uVPoint0(): Vector3 {
        if (this.mapType == MapType.Vindictus) {
            return Vector3Extensions.ToVector3(this.data, 284)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector3Extensions.ToVector3(this.data, 280)
        }

        return new Vector3(0, 0, 0)
    }

    public set uVPoint0(value: Vector3) {
        if (this.mapType == MapType.Vindictus) {
            value.getBytes(this.data, 284)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            value.getBytes(this.data, 280)
        }
    }

    public get uVPoint1(): Vector3 {
        if (this.mapType == MapType.Vindictus) {
            return Vector3Extensions.ToVector3(this.data, 296)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector3Extensions.ToVector3(this.data, 292)
        }

        return new Vector3(0, 0, 0)
    }

    public set uVPoint1(value: Vector3) {
        if (this.mapType == MapType.Vindictus) {
            value.getBytes(this.data, 296)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            value.getBytes(this.data, 292)
        }
    }

    public get uVPoint2(): Vector3 {
        if (this.mapType == MapType.Vindictus) {
            return Vector3Extensions.ToVector3(this.data, 308)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector3Extensions.ToVector3(this.data, 304)
        }

        return new Vector3(0, 0, 0)
    }

    public set uVPoint2(value: Vector3) {
        if (this.mapType == MapType.Vindictus) {
            value.getBytes(this.data, 308)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            value.getBytes(this.data, 304)
        }
    }

    public get uVPoint3(): Vector3 {
        if (this.mapType == MapType.Vindictus) {
            return Vector3Extensions.ToVector3(this.data, 320)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector3Extensions.ToVector3(this.data, 316)
        }

        return new Vector3(0, 0, 0)
    }

    public set uVPoint3(value: Vector3) {
        if (this.mapType == MapType.Vindictus) {
            value.getBytes(this.data, 320)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            value.getBytes(this.data, 316)
        }
    }

    public get origin(): Vector3 {
        if (this.mapType == MapType.Vindictus) {
            return Vector3Extensions.ToVector3(this.data, 332)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector3Extensions.ToVector3(this.data, 328)
        }

        return new Vector3(0, 0, 0)
    }

    public set origin(value: Vector3) {
        if (this.mapType == MapType.Vindictus) {
            value.getBytes(this.data, 332)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            value.getBytes(this.data, 328)
        }
    }

    public get basisNormal(): Vector3 {
        if (this.mapType == MapType.Vindictus) {
            return Vector3Extensions.ToVector3(this.data, 344)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return Vector3Extensions.ToVector3(this.data, 340)
        }

        return new Vector3(0, 0, 0)
    }

    public set basisNormal(value: Vector3) {
        if (this.mapType == MapType.Vindictus) {
            value.getBytes(this.data, 344)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            value.getBytes(this.data, 340)
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Overlay> {
        if (data == null) {
            throw new Error('ArgumentNullException')
        }

        const l = new Lump<Overlay>(Overlay, null, bsp, lumpInfo)
        l.fromData(data, Overlay.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }


    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (mapType == MapType.Vindictus) {
            return 356
        } else if (MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 352
        }

        throw new Error(`Lump object Overlay does not exist in map type ${mapType} or has not been implemented.`)
    }


    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Source)) {
            return 45
        }

        return -1
    }


    protected ctorCopy(source: Overlay, parent: ILump) {
        if (parent?.bsp) {
            if (source.parent != null && source.parent.bsp != null && source.parent.bsp.mapType == parent.bsp.mapType && source.lumpVersion == parent.lumpInfo.version) {
                this.data = new Uint8Array(source._data)
                return
            } else {
                this.data = new Uint8Array(Overlay.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent != null && source.parent.bsp != null) {
                this.data = new Uint8Array(Overlay.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(Overlay.GetStructLength(MapType.Undefined, 0))
            }
        }


        this.id = source.id
        this.textureInfoIndex = source.textureInfoIndex
        this.faceCountAndRenderOrder = source.faceCountAndRenderOrder
        this.faceIndices = source.faceIndices
        this.u = source.u
        this.v = source.v
        this.uVPoint0 = source.uVPoint0
        this.uVPoint1 = source.uVPoint1
        this.uVPoint2 = source.uVPoint2
        this.uVPoint3 = source.uVPoint3
        this.origin = source.origin
        this.basisNormal = source.basisNormal
    }

}