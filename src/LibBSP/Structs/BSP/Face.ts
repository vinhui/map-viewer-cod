import {ILumpObject} from '../Common/ILumpObject'
import {BSP, LumpInfo, MapType} from './BSP'
import {float, int} from '../../../utils/number'
import {Plane} from '../../Utils/Plane'
import {Texture} from './Texture'
import {Vertex} from '../Common/Vertex'
import {TextureInfo} from '../Common/TextureInfo'
import {Color} from '../../Utils/Color'
import {ColorExtensions} from '../../Extensions/ColorExtensions'
import {Vector2, Vector3} from '../../Utils/Vector'
import {Vector3Extensions} from '../../Extensions/Vector3Extensions'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'

export class Face extends ILumpObject<Face> {
    public get plane(): Plane {
        return this._parent.bsp.planes.get(this.planeIndex)
    }

    public get planeIndex(): int {
        if (this.mapType == MapType.Nightfire
            || this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(0)
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(32)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(16)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(0)
        }

        return -1
    }

    public set planeIndex(value: int) {
        if (this.mapType == MapType.Nightfire
            || this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(0, value)
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            view.setUint16(32, value)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            view.setUint16(16, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setUint16(0, value)
        }
    }

    public get planeSide(): boolean {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(2) > 0
        } else if (this.mapType == MapType.Vindictus) {
            return this.data[4] > 0
        } else if (this.mapType == MapType.Source17) {
            return this.data[34] > 0
        } else if (this.mapType == MapType.Source18) {
            return this.data[18] > 0
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return this.data[2] > 0
        }

        return true
    }

    public set planeSide(value: boolean) {
        if (this.mapType == MapType.Vindictus) {
            this.data[4] = (value ? 1 : 0)
        } else if (this.mapType == MapType.Source17) {
            this.data[34] = (value ? 1 : 0)
        } else if (this.mapType == MapType.Source18) {
            this.data[18] = (value ? 1 : 0)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            this.data[2] = (value ? 1 : 0)
        }
    }

    public get isOnNode(): boolean {
        if (this.mapType == MapType.Source17) {
            return this.data[35] > 0
        } else if (this.mapType == MapType.Source18) {
            return this.data[19] > 0
        } else if (this.mapType == MapType.Vindictus) {
            return this.data[5] > 0
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return this.data[3] > 0
        }

        return false
    }

    public set isOnNode(value: boolean) {
        if (this.mapType == MapType.Source17) {
            this.data[35] = (value ? 1 : 0)
        } else if (this.mapType == MapType.Source18) {
            this.data[19] = (value ? 1 : 0)
        } else if (this.mapType == MapType.Vindictus) {
            this.data[5] = (value ? 1 : 0)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            this.data[3] = (value ? 1 : 0)
        }
    }

    public get edgeIndices(): int[] {
        const arr = []
        for (let i = 0; i < this.numEdgeIndices; ++i) {
            arr.push(this._parent.bsp.faceEdges.get(this.firstEdgeIndexIndex + i))
        }
        return arr
    }

    public get firstEdgeIndexIndex(): int {
        if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(36)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(20)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(8)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(4)
        }

        return -1
    }

    public set firstEdgeIndexIndex(value: int) {
        if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, value)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            view.setInt32(20, value)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(8, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(4, value)
        }
    }

    public get numEdgeIndices(): int {
        if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(40)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(24)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(12)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(8)
        }

        return -1
    }

    public set numEdgeIndices(value: int) {
        if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            view.setUint16(40, value)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            view.setUint16(24, value)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(12, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setUint16(8, value)
        }
    }

    public get texture(): Texture {
        return this._parent.bsp.textures.get(this.textureIndex)
    }

    public get textureIndex(): int {
        if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(24)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(10)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(0)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(0)
        }

        return -1
    }

    public set textureIndex(value: int) {
        if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(24, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            const view = new DataView(this.data.buffer)
            view.setUint16(10, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setUint16(0, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(0, value)
        }
    }

    public get vertices(): Vertex[] {
        let arr = []
        for (let i = 0; i < this.numVertices; ++i) {
            arr.push(this._parent.bsp.vertices[this.firstVertexIndex + i])
        }
        return arr
    }

    public get firstVertexIndex(): int {
        if (this.mapType == MapType.Nightfire
            || this.mapType == MapType.CoD
            || this.mapType == MapType.CoDDemo
            || this.mapType == MapType.CoD2) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(4)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(12)
        }

        return -1
    }

    public set firstVertexIndex(value: int) {
        if (this.mapType == MapType.Nightfire
            || this.mapType == MapType.CoD
            || this.mapType == MapType.CoDDemo
            || this.mapType == MapType.CoD2) {
            const view = new DataView(this.data.buffer)
            view.setInt32(4, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(12, value)
        }
    }

    public get numVertices(): int {
        if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(8)
        } else if (this.mapType == MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(16)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(8)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(16)
        }

        return -1
    }

    public set numVertices(value: int) {
        if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(8, value)
        } else if (this.mapType == MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            view.setInt16(16, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(8, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(16, value)
        }
    }

    public get material(): Texture {
        return this._parent.bsp.materials.get(this.textureIndex)
    }

    public get materialIndex(): int {
        if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(28)
        }

        return -1
    }

    public set materialIndex(value: int) {
        if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(28, value)
        }
    }

    public get textureInfo(): TextureInfo {
        return this._parent.bsp.textureInfo.get(this.textureInfoIndex)
    }

    public get textureInfoIndex(): int {
        if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(32)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(16)
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(42)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(26)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(10)
        }

        return -1
    }

    public set textureInfoIndex(value: int) {
        if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(32, value)
        } else if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(16, value)
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            view.setUint16(42, value)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            view.setUint16(26, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setUint16(10, value)
        }
    }

    public get lightmapTextureInfo(): TextureInfo {
        return this._parent.bsp.textureInfo.get(this.lightmapTextureInfoIndex)
    }

    public get lightmapTextureInfoIndex(): int {
        if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(36)
        }

        return -1
    }

    public set lightmapTextureInfoIndex(value: int) {
        if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, value)
        }
    }

    public get displacementIndex(): int {
        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(20)
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(44)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(28)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(12)
        }

        return -1
    }

    public set displacementIndex(value: int) {
        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(20, value)
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            view.setInt16(44, value)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            view.setInt16(28, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(12, value)
        }
    }

    public get surfaceFogVolumeID(): int {
        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(24)
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(46)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(30)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(14)
        }

        return -1
    }

    public set surfaceFogVolumeID(value: int) {
        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(24, value)
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            view.setInt16(46, value)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            view.setInt16(30, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(14, value)
        }
    }

    public get originalFace(): Face {
        return this._parent.bsp.originalFaces.get(this.originalFaceIndex)
    }

    public get originalFaceIndex(): int {
        if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                return view.getInt32(60)
            } else {
                const view = new DataView(this.data.buffer)
                return view.getInt32(56)
            }
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(96)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(60)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(44)
        }

        return -1
    }

    public set originalFaceIndex(value: int) {
        if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                view.setInt32(60, value)
            } else {
                const view = new DataView(this.data.buffer)
                view.setInt32(56, value)
            }
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            view.setInt32(96, value)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            view.setInt32(60, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(44, value)
        }
    }

    public get type(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(8)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(20)
        }

        return -1
    }

    public set type(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(8, value)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(20, value)
        }
    }

    public get effect(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(4)
        }

        return -1
    }

    public set effect(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(4, value)
        }
    }

    public get indices(): int[] {
        const arr = []
        for (let i = 0; i < this.numIndices; ++i) {
            arr.push(this._parent.bsp.indices.get(this.firstIndexIndex + i))
        }
        return arr
    }

    public get firstIndexIndex(): int {
        if (this.mapType == MapType.Nightfire
            || this.mapType == MapType.CoD
            || this.mapType == MapType.CoDDemo
            || this.mapType == MapType.CoD2) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(12)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(20)
        }

        return -1
    }

    public set firstIndexIndex(value: int) {
        if (this.mapType == MapType.Nightfire
            || this.mapType == MapType.CoD
            || this.mapType == MapType.CoDDemo
            || this.mapType == MapType.CoD2) {
            const view = new DataView(this.data.buffer)
            view.setInt32(12, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(20, value)
        }
    }

    public get numIndices(): int {
        if (this.mapType == MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(18)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(10)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(16)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(24)
        }

        return -1
    }

    public set numIndices(value: int) {
        if (this.mapType == MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            view.setInt16(18, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(10, value)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(16, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(24, value)
        }
    }

    public get averageLightColors(): Color[] {
        if (this.mapType == MapType.Source17) {
            const colors = []
            for (let i = 0; i < 8; ++i) {
                colors[i] = ColorExtensions.FromArgb(this.data[(i * 4) + 3], this.data[(i * 4)], this.data[(i * 4) + 1], this.data[(i * 4) + 2])
            }
            return colors
        }

        return []
    }

    public set averageLightColors(value: Color[]) {
        if (this.mapType == MapType.Source17) {
            for (let i = 0; i < value.length; ++i) {
                value[i].getBytes(this.data, i * 4)
            }
        }
    }

    public get lightmapStyles(): Uint8Array {
        if (this.mapType == MapType.SiN) {
            return this.data.slice(12, 12 + 16)
        } else if (this.mapType == MapType.SoF) {
            return this.data.slice(22, 22 + 4)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            return this.data.slice(12, 12 + 4)
        } else if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                return this.data.slice(28, 28 + 8)
            } else {
                return this.data.slice(24, 24 + 8)
            }
        } else if (this.mapType == MapType.Source17) {
            return this.data.slice(48, 48 + 8)
        } else if (this.mapType == MapType.Source18) {
            return this.data.slice(32, 32 + 8)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return this.data.slice(16, 16 + 4)
        } else if (this.mapType == MapType.Nightfire) {
            return this.data.slice(40, 40 + 4)
        }
        return new Uint8Array()

    }

    public set lightmapStyles(value: Uint8Array) {
        if (this.mapType == MapType.SiN) {
            this.data.set(value.slice(0, Math.min(value.length, 16)), 12)
        } else if (this.mapType == MapType.SoF) {
            this.data.set(value.slice(0, Math.min(value.length, 4)), 22)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            this.data.set(value.slice(0, Math.min(value.length, 4)), 12)
        } else if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                this.data.set(value.slice(0, Math.min(value.length, 8)), 28)
            } else {
                this.data.set(value.slice(0, Math.min(value.length, 8)), 24)
            }
        } else if (this.mapType == MapType.Source17) {
            this.data.set(value.slice(0, Math.min(value.length, 8)), 48)
        } else if (this.mapType == MapType.Source18) {
            this.data.set(value.slice(0, Math.min(value.length, 8)), 32)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            this.data.set(value.slice(0, Math.min(value.length, 4)), 16)
        } else if (this.mapType == MapType.Nightfire) {
            this.data.set(value.slice(0, Math.min(value.length, 4)), 40)
        }
    }

    public get dayLightStyle(): Uint8Array {
        if (this.mapType == MapType.Source17) {
            return this.data.slice(56, 56 + 8)
        }
        return new Uint8Array()
    }

    public set dayLightStyle(value: Uint8Array) {
        if (this.mapType == MapType.Source17) {
            this.data.set(value.slice(56, 56 + 8))
        }
    }

    public get nightLightStyle(): Uint8Array {
        if (this.mapType == MapType.Source17) {
            return this.data.slice(64, 64 + 8)
        }

        return new Uint8Array()
    }

    public set nightLightStyle(value: Uint8Array) {
        if (this.mapType == MapType.Source17) {
            this.data.set(value.slice(64, 64 + 8))
        }
    }

    public get lightmap(): int {
        if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(36)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(44)
        } else if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                return view.getInt32(36)
            } else {
                const view = new DataView(this.data.buffer)
                return view.getInt32(32)
            }
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(72)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(36)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.CoD) && this.mapType != MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(2)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.SiN
            || this.mapType == MapType.SoF) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(28)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(16)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(20)
        }

        return -1
    }

    public set lightmap(value: int) {
        if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, value)
        } else if (this.mapType == MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(44, value)
        } else if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                view.setInt32(36, value)
            } else {
                const view = new DataView(this.data.buffer)
                view.setInt32(32, value)
            }
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            view.setInt32(72, value)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.CoD) && this.mapType != MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            view.setInt16(2, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.SiN
            || this.mapType == MapType.SoF) {
            const view = new DataView(this.data.buffer)
            view.setInt32(28, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)
            || MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(16, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(20, value)
        }
    }

    public get lightmap2(): int {
        if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(40)
        }

        return -1
    }

    public set lightmap2(value: int) {
        if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            view.setInt32(40, value)
        }
    }

    public get lightmap3(): int {
        if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(44)
        }

        return -1
    }

    public set lightmap3(value: int) {
        if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            view.setInt32(44, value)
        }
    }

    public get lightmap4(): int {
        if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(48)
        }

        return -1
    }

    public set lightmap4(value: int) {
        if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            view.setInt32(48, value)
        }
    }

    public get area(): float {
        if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                return view.getFloat32(40)
            } else {
                const view = new DataView(this.data.buffer)
                return view.getFloat32(36)
            }
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            return view.getFloat32(76)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            return view.getFloat32(40)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getFloat32(24)
        }

        return -1
    }

    public set area(value: float) {
        if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                view.setFloat32(40, value)
            } else {
                const view = new DataView(this.data.buffer)
                view.setFloat32(36, value)
            }
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            view.setFloat32(76, value)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            view.setFloat32(40, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setFloat32(24, value)
        }
    }

    public get lightmapStart(): Vector2 {
        if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                return new Vector2(view.getInt32(44), view.getInt32(48))
            } else {
                const view = new DataView(this.data.buffer)
                return new Vector2(view.getInt32(40), view.getInt32(44))
            }
        } else if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            return new Vector2(view.getInt32(52), view.getInt32(56))
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            return new Vector2(view.getInt32(80), view.getInt32(84))
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            return new Vector2(view.getInt32(44), view.getInt32(48))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return new Vector2(view.getInt32(32), view.getInt32(36))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return new Vector2(view.getInt32(28), view.getInt32(32))
        }

        return new Vector2(0, 0)
    }

    public set lightmapStart(value: Vector2) {
        if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                view.setInt32(44, Math.trunc(value.x))
                view.setInt32(48, Math.trunc(value.y))
            } else {
                const view = new DataView(this.data.buffer)
                view.setInt32(40, Math.trunc(value.x))
                view.setInt32(44, Math.trunc(value.y))
            }
        } else if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            view.setInt32(52, Math.trunc(value.x))
            view.setInt32(56, Math.trunc(value.y))
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            view.setInt32(80, Math.trunc(value.x))
            view.setInt32(84, Math.trunc(value.y))
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            view.setInt32(44, Math.trunc(value.x))
            view.setInt32(48, Math.trunc(value.y))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(32, Math.trunc(value.x))
            view.setInt32(36, Math.trunc(value.y))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(28, Math.trunc(value.x))
            view.setInt32(32, Math.trunc(value.y))
        }
    }

    public get lightmap2Start(): Vector2 {
        if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            return new Vector2(view.getInt32(60), view.getInt32(64))
        }

        return new Vector2(0, 0)
    }

    public set lightmap2Start(value: Vector2) {
        if (this.mapType == MapType.Raven) {
            value.getBytes(this.data, 60)
        }
    }

    public get lightmap3Start(): Vector2 {
        if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            return new Vector2(view.getInt32(68), view.getInt32(72))
        }

        return new Vector2(0, 0)
    }

    public set lightmap3Start(value: Vector2) {
        if (this.mapType == MapType.Raven) {
            value.getBytes(this.data, 68)
        }
    }

    public get lightmap4Start(): Vector2 {
        if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            return new Vector2(view.getInt32(76), view.getInt32(80))
        }

        return new Vector2(0, 0)
    }

    public set lightmap4Start(value: Vector2) {
        if (this.mapType == MapType.Raven) {
            value.getBytes(this.data, 76)
        }
    }

    public get lightmapSize(): Vector2 {
        if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                return new Vector2(view.getInt32(52), view.getInt32(56))
            } else {
                const view = new DataView(this.data.buffer)
                return new Vector2(view.getInt32(48), view.getInt32(52))
            }
        } else if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            return new Vector2(view.getInt32(84), view.getInt32(88))
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            return new Vector2(view.getInt32(88), view.getInt32(92))
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            return new Vector2(view.getInt32(52), view.getInt32(56))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return new Vector2(view.getInt32(40), view.getInt32(44))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return new Vector2(view.getInt32(36), view.getInt32(40))
        }

        return new Vector2(0, 0)
    }

    public set lightmapSize(value: Vector2) {
        if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                view.setInt32(52, Math.trunc(value.x))
                view.setInt32(56, Math.trunc(value.y))
            } else {
                const view = new DataView(this.data.buffer)
                view.setInt32(48, Math.trunc(value.x))
                view.setInt32(52, Math.trunc(value.y))
            }
        } else if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            view.setInt32(84, Math.trunc(value.x))
            view.setInt32(88, Math.trunc(value.y))
        } else if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            view.setInt32(88, Math.trunc(value.x))
            view.setInt32(92, Math.trunc(value.y))
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            view.setInt32(52, Math.trunc(value.x))
            view.setInt32(56, Math.trunc(value.y))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(40, Math.trunc(value.x))
            view.setInt32(44, Math.trunc(value.y))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, Math.trunc(value.x))
            view.setInt32(40, Math.trunc(value.y))
        }
    }

    public get lightmapOrigin(): Vector3 {
        if (this.mapType == MapType.Raven) {
            return Vector3Extensions.ToVector3(this.data, 92)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            return Vector3Extensions.ToVector3(this.data, 48)
        }

        return new Vector3(0, 0, 0)
    }

    public set lightmapOrigin(value: Vector3) {
        if (this.mapType == MapType.Raven) {
            value.getBytes(this.data, 92)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            value.getBytes(this.data, 48)
        }
    }

    public get lightmapUAxis(): Vector3 {
        if (this.mapType == MapType.Raven) {
            return Vector3Extensions.ToVector3(this.data, 104)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            return Vector3Extensions.ToVector3(this.data, 60)
        }

        return new Vector3(0, 0, 0)
    }

    public set lightmapUAxis(value: Vector3) {
        if (this.mapType == MapType.Raven) {
            value.getBytes(this.data, 104)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            value.getBytes(this.data, 60)
        }
    }

    public get lightmapVAxis(): Vector3 {
        if (this.mapType == MapType.Raven) {
            return Vector3Extensions.ToVector3(this.data, 116)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            return Vector3Extensions.ToVector3(this.data, 72)
        }

        return new Vector3(0, 0, 0)
    }

    public set lightmapVAxis(value: Vector3) {
        if (this.mapType == MapType.Raven) {
            value.getBytes(this.data, 116)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            value.getBytes(this.data, 72)
        }
    }

    public get normal(): Vector3 {
        if (this.mapType == MapType.Raven) {
            return Vector3Extensions.ToVector3(this.data, 128)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            return Vector3Extensions.ToVector3(this.data, 84)
        }

        return new Vector3(0, 0, 0)
    }

    public set normal(value: Vector3) {
        if (this.mapType == MapType.Raven) {
            value.getBytes(this.data, 128)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            value.getBytes(this.data, 84)
        }
    }

    public get patchSize(): Vector2 {
        if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            return new Vector2(view.getInt32(140), view.getInt32(144))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return new Vector2(view.getInt32(96), view.getInt32(100))
        }

        return new Vector2(0, 0)
    }

    public set patchSize(value: Vector2) {
        if (this.mapType == MapType.Raven) {
            const view = new DataView(this.data.buffer)
            view.setInt32(140, Math.trunc(value.x))
            view.setInt32(144, Math.trunc(value.y))
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3) && !MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(96, Math.trunc(value.x))
            view.setInt32(100, Math.trunc(value.y))
        }
    }

    public get numPrimitives(): int {
        if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                return view.getInt32(64)
            } else {
                const view = new DataView(this.data.buffer)
                return view.getInt32(60)
            }
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(64)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source) && this.mapType != MapType.Source17) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(48)
        }

        return -1
    }

    public set numPrimitives(value: int) {
        if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                view.setInt32(64, value)
            } else {
                const view = new DataView(this.data.buffer)
                view.setInt32(60, value)
            }
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            view.setInt16(64, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source) && this.mapType != MapType.Source17) {
            const view = new DataView(this.data.buffer)
            view.setInt16(48, value)
        }
    }

    public get firstPrimitive(): int {
        if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                return view.getInt32(68)
            } else {
                const view = new DataView(this.data.buffer)
                return view.getInt32(64)
            }
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(66)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source) && this.mapType != MapType.Source17) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(50)
        }

        return -1
    }

    public set firstPrimitive(value: int) {
        if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                view.setInt32(68, value)
            } else {
                const view = new DataView(this.data.buffer)
                view.setInt32(64, value)
            }
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            view.setInt16(66, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source) && this.mapType != MapType.Source17) {
            const view = new DataView(this.data.buffer)
            view.setInt16(50, value)
        }
    }

    public get smoothingGroups(): int {
        if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(100)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(68)
        } else if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                return view.getInt32(72)
            } else {
                const view = new DataView(this.data.buffer)
                return view.getInt32(68)
            }
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(52)
        }

        return 0
    }

    public set smoothingGroups(value: int) {
        if (this.mapType == MapType.Source17) {
            const view = new DataView(this.data.buffer)
            view.setInt32(100, value)
        } else if (this.mapType == MapType.Source18) {
            const view = new DataView(this.data.buffer)
            view.setInt32(68, value)
        } else if (this.mapType == MapType.Vindictus) {
            if (this.lumpVersion == 2) {
                const view = new DataView(this.data.buffer)
                view.setInt32(72, value)
            } else {
                const view = new DataView(this.data.buffer)
                view.setInt32(68, value)
            }
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(52, value)
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Face> {
        if (data == null) {
            throw new Error('ArgumentNullException')
        }

        const l = new Lump<Face>(Face, null, bsp, lumpInfo)
        l.fromData(data, Face.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }


    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (mapType == MapType.CoD4) {
            return 24
        } else if (mapType == MapType.SiN) {
            return 36
        } else if (mapType == MapType.SoF) {
            return 40
        } else if (mapType == MapType.Nightfire) {
            return 48
        } else if (mapType == MapType.Source17) {
            return 104
        } else if (mapType == MapType.Source18) {
            return 72
        } else if (mapType == MapType.Vindictus) {
            if (lumpVersion == 2) {
                return 76
            } else {
                return 72
            }
        } else if (mapType == MapType.Raven) {
            return 148
        } else if (MapType.IsSubtypeOf(mapType, MapType.FAKK2)
            || MapType.IsSubtypeOf(mapType, MapType.MOHAA)) {
            return 108
        } else if (MapType.IsSubtypeOf(mapType, MapType.STEF2)) {
            return 132
        } else if (MapType.IsSubtypeOf(mapType, MapType.CoD)) {
            return 16
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake)
            || MapType.IsSubtypeOf(mapType, MapType.Quake2)) {
            return 20
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake3)) {
            return 104
        } else if (MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 56
        }

        throw new Error(`Lump object Face does not exist in map type ${mapType} or has not been implemented.`)
    }


    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.FAKK2)
            || MapType.IsSubtypeOf(type, MapType.MOHAA)) {
            return 3
        } else if (MapType.IsSubtypeOf(type, MapType.STEF2)) {
            return 5
        } else if (MapType.IsSubtypeOf(type, MapType.Quake2)
            || type == MapType.CoD
            || type == MapType.CoDDemo) {
            return 6
        } else if (type == MapType.Nightfire
            || type == MapType.CoD4) {
            return 9
        } else if (type == MapType.Quake3
            || type == MapType.Raven
            || type == MapType.ET) {
            return 13
        } else if (MapType.IsSubtypeOf(type, MapType.Source)
            || MapType.IsSubtypeOf(type, MapType.Quake)
            || type == MapType.CoD2) {
            return 7
        }

        return -1
    }


    public static GetIndexForOriginalFacesLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Source)) {
            return 27
        } else if (type == MapType.CoD4) {
            // Not sure where else to put this. This is the simple surfaces lump?
            return 47
        }

        return -1
    }


    protected ctorCopy(source: Face, parent: ILump) {
        if (parent?.bsp) {
            if (source.parent != null && source.parent.bsp != null && source.parent.bsp.mapType == parent.bsp.mapType && source.lumpVersion == parent.lumpInfo.version) {
                this.data = new Uint8Array(source._data)
                return
            } else {
                this.data = new Uint8Array(Face.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent != null && source.parent.bsp != null) {
                this.data = new Uint8Array(Face.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(Face.GetStructLength(MapType.Undefined, 0))
            }
        }

        this.planeIndex = source.planeIndex
        this.planeSide = source.planeSide
        this.isOnNode = source.isOnNode
        this.firstEdgeIndexIndex = source.firstEdgeIndexIndex
        this.numEdgeIndices = source.numEdgeIndices
        this.textureIndex = source.textureIndex
        this.firstVertexIndex = source.firstVertexIndex
        this.numVertices = source.numVertices
        this.materialIndex = source.materialIndex
        this.textureInfoIndex = source.textureInfoIndex
        this.lightmapTextureInfoIndex = source.lightmapTextureInfoIndex
        this.displacementIndex = source.displacementIndex
        this.surfaceFogVolumeID = source.surfaceFogVolumeID
        this.originalFaceIndex = source.originalFaceIndex
        this.type = source.type
        this.effect = source.effect
        this.firstIndexIndex = source.firstIndexIndex
        this.numIndices = source.numIndices
        this.averageLightColors = source.averageLightColors
        this.lightmapStyles = source.lightmapStyles
        this.dayLightStyle = source.dayLightStyle
        this.nightLightStyle = source.nightLightStyle
        this.lightmap = source.lightmap
        this.lightmap2 = source.lightmap2
        this.lightmap3 = source.lightmap3
        this.lightmap4 = source.lightmap4
        this.area = source.area
        this.lightmapStart = source.lightmapStart
        this.lightmap2Start = source.lightmap2Start
        this.lightmap3Start = source.lightmap3Start
        this.lightmap4Start = source.lightmap4Start
        this.lightmapSize = source.lightmapSize
        this.lightmapOrigin = source.lightmapOrigin
        this.lightmapUAxis = source.lightmapUAxis
        this.lightmapVAxis = source.lightmapVAxis
        this.normal = source.normal
        this.patchSize = source.patchSize
        this.numPrimitives = source.numPrimitives
        this.firstPrimitive = source.firstPrimitive
        this.smoothingGroups = source.smoothingGroups
    }


}