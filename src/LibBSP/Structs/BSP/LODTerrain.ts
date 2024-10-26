import {ILumpObject} from '../Common/ILumpObject'
import {byte, float, int, sbyte, short} from '../../../utils/number'
import {BSP, LumpInfo, MapType} from './BSP'
import {Texture} from './Texture'
import {generate2dTypedArray} from '../../../utils/array'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'

export class LODTerrain extends ILumpObject<LODTerrain> {
    public get flags(): byte {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            return this.data[0]
        }

        return 0
    }

    public set flags(value: byte) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            this.data[0] = value
        }
    }

    public get scale(): byte {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            return this.data[1]
        }

        return 0
    }

    public set scale(value: byte) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            this.data[1] = value
        }
    }

    public get lightmapCoordinates(): Uint8Array {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            return this.data.slice(2, 2 + 2)
        }

        return null
    }

    public set lightmapCoordinates(value: Uint8Array) {
        if (value.length !== 2) {
            throw new Error('LightmapCoordinates array must have 2 elements.')
        }

        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            this.data.set(value, 2)
        }
    }

    public get uvs(): float[] {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            const view = new DataView(this.data.buffer)
            return [
                view.getFloat32(4),
                view.getFloat32(8),
                view.getFloat32(12),
                view.getFloat32(16),
                view.getFloat32(20),
                view.getFloat32(24),
                view.getFloat32(28),
                view.getFloat32(32),
            ]
        }

        return null
    }

    public set uvs(value: float[]) {
        if (value.length !== 8) {
            throw new Error('UVs array must have 8 elements.')
        }

        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            let offset = 4
            for (let i = 0; i < value.length; ++i) {
                const view = new DataView(this.data.buffer)
                view.setFloat32(offset + (i * 4), value[i])
            }
        }
    }

    public get x(): sbyte {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {

            const view = new DataView(this.data.buffer)
            return view.getInt8(36)
        }

        return 0
    }

    public set x(value: sbyte) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            this.data[36] = value
        }
    }

    public get y(): sbyte {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            const view = new DataView(this.data.buffer)
            view.getInt8(37)
        }

        return 0
    }

    public set y(value: sbyte) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            this.data[37] = value
        }
    }

    public get baseZ(): short {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(38)
        }

        return 0
    }

    public set baseZ(value: short) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(38, value)
        }
    }

    public get texture(): Texture {
        return this._parent.bsp.textures.get(this.textureIndex)
    }

    public get textureIndex(): short {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(40)
        }

        return -1
    }

    public set textureIndex(value: short) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(40, value)
        }
    }

    public get lightmap(): short {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(42)
        }

        return -1
    }

    public set lightmap(value: short) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(42, value)
        }
    }

    public get vertexFlags(): Uint16Array[] {
        const ret = generate2dTypedArray(Uint16Array, 2, 63)
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            const view = new DataView(this.data.buffer)

            for (let i = 0; i < ret.length; ++i) {
                for (let j = 0; j < ret[1].length; ++j) {
                    ret[i][j] = view.getUint16(52 + (i * 126) + (j * 2))
                }
            }
        }

        return ret
    }

    public set vertexFlags(value: Uint16Array[]) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            if (value.length !== 2 || value[0].length !== 63) {
                throw new Error('VertexFlags array must be size (2, 63) elements.')
            }
            const view = new DataView(this.data.buffer)
            for (let i = 0; i < value.length; ++i
            ) {
                for (let j = 0; j < value[i].length; ++j
                ) {
                    view.setUint16(52 + (i * 126) + (j * 2), value[i][j])
                }
            }
        }
    }

    public get heightmap(): Uint8Array[] {
        const ret = generate2dTypedArray(Uint8Array, 9, 9)
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            for (let i = 0; i < ret.length; ++i) {
                for (let j = 0; j < ret[i].length; ++j
                ) {
                    ret[i][j] = this.data[304 + (i * 9) + j]
                }
            }
        }

        return ret
    }

    public set heightmap(value: Uint8Array[]) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            if (value.length !== 9 || value[0].length !== 9) {
                throw new Error('Heightmap array must be size (9, 9) elements.')
            }
            for (let i = 0; i < value.length; ++i
            ) {
                for (let j = 0; j < value[i].length; ++j
                ) {
                    this.data[304 + (i * 9) + j] = value[i][j]
                }
            }
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<LODTerrain> {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const l = new Lump<LODTerrain>(LODTerrain, null, bsp, lumpInfo)
        l.fromData(data, LODTerrain.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }


    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        if (MapType.IsSubtypeOf(mapType, MapType.MOHAA)) {
            return 388
        }

        throw new Error(`Lump object LODTerrain does not exist in map type ${mapType} or has not been implemented.`)
    }


    public static GetIndexForLump(type: MapType): int {
        if (type === MapType.MOHAADemo) {
            return 23
        } else if (MapType.IsSubtypeOf(type, MapType.MOHAA)) {
            return 22
        }

        return -1
    }


    protected ctorCopy(source: LODTerrain, parent: ILump) {
        this._parent = parent

        if (parent?.bsp) {
            if (source.parent?.bsp && source.parent.bsp.mapType === parent.bsp.mapType && source.lumpVersion === parent.lumpInfo.version) {
                this.data = new Uint8Array(source.data)
                return
            } else {
                this.data = new Uint8Array(LODTerrain.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent?.bsp) {
                this.data = new Uint8Array(LODTerrain.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(LODTerrain.GetStructLength(MapType.Undefined, 0))
            }
        }

        this.flags = source.flags
        this.scale = source.scale
        this.lightmapCoordinates = source.lightmapCoordinates
        this.uvs = source.uvs
        this.x = source.x
        this.y = source.y
        this.baseZ = source.baseZ
        this.textureIndex = source.textureIndex
        this.lightmap = source.lightmap
        this.vertexFlags = source.vertexFlags
        this.heightmap = source.heightmap
    }

}