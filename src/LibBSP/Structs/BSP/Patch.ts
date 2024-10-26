import {ILumpObject} from '../Common/ILumpObject'
import {Texture} from './Texture'
import {int, short} from '../../../utils/number'
import {BSP, LumpInfo, MapType} from './BSP'
import {Vector2, Vector3} from '../../Util/Vector'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'

export class Patch extends ILumpObject<Patch> {
    public get shader(): Texture {
        return this._parent.bsp.textures.get(this.shaderIndex)
    }

    public get shaderIndex(): int {
        switch (this.mapType) {
            case MapType.CoD: {
                const view = new DataView(this.data.buffer)
                return view.getInt16(0, true)
            }
            default: {
                return -1
            }
        }
    }


    public set shaderIndex(value: int) {
        switch (this.mapType) {
            case MapType.CoD: {
                const view = new DataView(this.data.buffer)
                view.setInt16(0, value)
                break
            }
        }
    }

    public get type(): short {
        switch (this.mapType) {
            case MapType.CoD: {
                const view = new DataView(this.data.buffer)
                return view.getInt16(2, true)
            }
            default: {
                return -1
            }
        }
    }


    public set type(value: short) {
        switch (this.mapType) {
            case MapType.CoD: {
                const view = new DataView(this.data.buffer)
                view.setInt16(2, value)
                break
            }
        }
    }

    public get dimensions(): Vector2 {
        switch (this.mapType) {
            case MapType.CoD: {
                if (this.type === 0) {
                    const view = new DataView(this.data.buffer)
                    return new Vector2(view.getInt16(4, true), view.getInt16(6, true))
                } else {
                    return new Vector2(0, 0)
                }
            }
            default: {
                return new Vector2(0, 0)
            }
        }
    }


    public set dimensions(value: Vector2) {
        switch (this.mapType) {
            case MapType.CoD: {
                if (this.type === 0) {
                    const view = new DataView(this.data.buffer)
                    view.setInt16(4, Math.trunc(value.x))
                    view.setInt16(6, Math.trunc(value.y))
                }
                break
            }
        }
    }

    public get flags(): int {
        switch (this.mapType) {
            case MapType.CoD: {
                if (this.type === 0) {
                    const view = new DataView(this.data.buffer)
                    return view.getInt32(8, true)
                } else {
                    return -1
                }
            }
            default: {
                return -1
            }
        }
    }


    public set flags(value: int) {
        switch (this.mapType) {
            case MapType.CoD: {
                if (this.type === 0) {
                    const view = new DataView(this.data.buffer)
                    view.setInt32(8, value)
                }
                break
            }
        }
    }


    public get vertices(): Vector3[] {
        const arr = []
        for (let i = 0; i < this.numVertices; ++i) {
            arr.push(this._parent.bsp.patchVertices.get(this.firstVertex + i))
        }
        return arr
    }

    public get 'patchVertices_Index'(): int {
        return this.firstVertex
    }

    public get firstVertex(): int {
        switch (this.mapType) {
            case MapType.CoD: {
                if (this.type === 0) {
                    const view = new DataView(this.data.buffer)
                    return view.getInt32(12, true)
                } else if (this.type === 1) {
                    const view = new DataView(this.data.buffer)
                    return view.getInt32(8, true)
                } else {
                    return -1
                }
            }
            default: {
                return -1
            }
        }
    }

    public set firstVertex(value: int) {
        switch (this.mapType) {
            case MapType.CoD: {
                if (this.type === 0) {
                    const view = new DataView(this.data.buffer)
                    view.setInt32(12, value)
                } else if (this.type === 1) {
                    const view = new DataView(this.data.buffer)
                    view.setInt32(8, value)
                }
                break
            }
        }
    }

    public get 'patchVertices_Count'(): int {
        return this.numVertices
    }

    public get numVertices(): int {
        switch (this.mapType) {
            case MapType.CoD: {
                if (this.type === 0) {
                    const view = new DataView(this.data.buffer)
                    return view.getInt16(4, true) * view.getInt16(6, true)
                } else if (this.type === 1) {
                    const view = new DataView(this.data.buffer)
                    return view.getInt16(4, true)
                } else {
                    return -1
                }
            }
            default: {
                return -1
            }
        }
    }

    public set numVertices(value: int) {
        switch (this.mapType) {
            case MapType.CoD: {
                if (this.type === 1) {
                    const view = new DataView(this.data.buffer)
                    view.setInt16(4, value)
                } else {
                    throw new Error('Cannot set count of Patch Vertices on a pure patch. Set Patch.Dimensions instead.')
                }
                break
            }
        }
    }

    public get vertexIndices(): short[] {
        const arr = []
        for (let i = 0; i < this.numVertexIndices; ++i) {
            arr.push(Math.trunc(Number(this._parent.bsp.patchIndices.get(this.firstVertexIndex + i))))
        }
        return arr
    }

    public get 'patchIndices_Count'(): int {
        return this.numVertexIndices
    }

    public get numVertexIndices(): int {
        switch (this.mapType) {
            case MapType.CoD: {
                if (this.type === 1) {
                    const view = new DataView(this.data.buffer)
                    return view.getInt16(6, true)
                } else {
                    return -1
                }
            }
            default: {
                return -1
            }
        }
    }

    public set numVertexIndices(value: int) {
        switch (this.mapType) {
            case MapType.CoD: {
                if (this.type === 1) {
                    const view = new DataView(this.data.buffer)
                    view.setInt16(6, value)
                }
                break
            }
        }
    }

    public get 'patchIndices_Index'(): int {
        return this.firstVertexIndex
    }

    public get firstVertexIndex(): int {
        switch (this.mapType) {
            case MapType.CoD: {
                if (this.type === 1) {
                    const view = new DataView(this.data.buffer)
                    return view.getInt32(12, true)
                } else {
                    return -1
                }
            }
            default: {
                return -1
            }
        }
    }

    public set firstVertexIndex(value: int) {
        switch (this.mapType) {
            case MapType.CoD: {
                if (this.type === 1) {
                    const view = new DataView(this.data.buffer)
                    view.setInt32(12, value)
                }
                break
            }
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Patch> {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const l = new Lump<Patch>(Patch, null, bsp, lumpInfo)
        l.fromData(data, Patch.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }


    public static GetStructLength(mapType: MapType, lumpVersion: int = 0): int {
        switch (mapType) {
            case MapType.CoD: {
                return 16
            }
            default: {
                throw new Error(`Lump object Patch does not exist in map type ${mapType} or has not been implemented.`)
            }
        }
    }


    public static GetIndexForLump(type: MapType): int {
        switch (type) {
            case MapType.CoD: {
                return 24
            }
            default: {
                return -1
            }
        }
    }


    protected ctorCopy(source: Patch, parent: ILump) {
        this._parent = parent

        if (parent?.bsp) {
            if (source.parent?.bsp && source.parent.bsp.mapType === parent.bsp.mapType && source.lumpVersion === parent.lumpInfo.version) {
                this.data = new Uint8Array(source.data)
                return
            } else {
                this.data = new Uint8Array(Patch.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent?.bsp) {
                this.data = new Uint8Array(Patch.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(Patch.GetStructLength(MapType.Undefined, 0))
            }
        }


        this.shaderIndex = source.shaderIndex
        this.type = source.type

        if (this.type === 0) {
            this.dimensions = source.dimensions
            this.flags = source.flags
        } else if (this.type === 1) {
            this.numVertices = source.numVertices
            this.numVertexIndices = source.numVertexIndices
            this.firstVertexIndex = source.firstVertexIndex
        }

        this.firstVertex = source.firstVertex
    }

}