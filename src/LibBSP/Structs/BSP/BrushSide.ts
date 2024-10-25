import {ILumpObject} from '../Common/ILumpObject'
import {BSP, LumpInfo, MapType} from './BSP'
import {Plane} from '../../Utils/Plane'
import {Texture} from './Texture'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'
import {float} from '../../../utils/number'

export class BrushSide extends ILumpObject<BrushSide> {
    public get plane(): Plane {
        return this._parent.bsp.planes.get(this.planeIndex)
    }

    /// <summary>
    /// Gets or sets the index of the Plane used by this <see cref="BrushSide"/>.
    /// </summary>
    public get planeIndex(): int {
        if (this.mapType == MapType.STEF2
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(4)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Vindictus) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(0)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            return view.getUint16(0)
        }

        return -1
    }

    public set planeIndex(value: int) {
        if (this.mapType == MapType.STEF2
            || this.mapType == MapType.Nightfire) {
            const view = new DataView(this._data.buffer)
            view.setInt32(4, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Vindictus) {
            const view = new DataView(this._data.buffer)
            view.setInt32(0, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.setInt16(0, value)
        }
    }

/// <summary>
/// In Call of Duty based maps, gets or sets the distance of this <see cref="BrushSide"/> from its axis.
/// </summary>
    public get distance(): float {
        if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this._data.buffer)
            return view.getFloat32(0)
        }

        return 0
    }

    public set distance(value: float) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this._data.buffer)
            view.setFloat32(0, value)
        }
    }

/// <summary>
/// Gets the <see cref="LibBSP.Texture"/> referenced by this <see cref="BrushSide"/>.
/// </summary>
    public get Texture(): Texture {
        return this._parent.bsp.textures.get(this.textureIndex)
    }

/// <summary>
/// Gets or sets the index of the <see cref="LibBSP.Texture"/> used by this <see cref="BrushSide"/>.
/// </summary>
    public get textureIndex(): int {
        if (this.mapType == MapType.STEF2) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(0)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Vindictus) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(4)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.getInt16(2)
        }

        return -1
    }

    public set textureIndex(value: int) {
        if (this.mapType == MapType.STEF2) {
            const view = new DataView(this._data.buffer)
            view.setInt32(0, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType == MapType.Vindictus) {
            const view = new DataView(this._data.buffer)
            view.setInt32(4, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.setInt16(2, value)
        }
    }

/// <summary>
/// Gets the <see cref="LibBSP.Face"/> referenced by this <see cref="BrushSide"/>.
/// </summary>
    public get face(): Face {
        return this._parent.bsp.faces.get(this.faceIndex)
    }

/// <summary>
/// Gets or sets the index of the <see cref="LibBSP.Face"/> used by this <see cref="BrushSide"/>.
/// </summary>
    public get faceIndex(): int {
        switch (this.mapType) {
            case MapType.Nightfire: {
                const view = new DataView(this._data.buffer)
                return view.getInt32(0)
            }
            case MapType.Raven: {
                const view = new DataView(this._data.buffer)
                return view.getInt32(8)
            }
            default: {
                return -1
            }
        }
    }

    public set faceIndex(value: int) {
        switch (this.mapType) {
            case MapType.Nightfire: {
                const view = new DataView(this._data.buffer)
                view.setInt32(0, value)
                break
            }
            case MapType.Raven: {
                const view = new DataView(this._data.buffer)
                view.setInt32(8, value)
                break
            }
        }
    }

/// <summary>
/// In Source engine, gets the <see cref="LibBSP.Displacement"/> referenced by this <see cref="BrushSide"/>.
/// This is never used since the brushes used to create Displacements are optimized out.
/// </summary>
    public get displacement(): Displacement {
        return this._parent.bsp.displacements.get(this.displacementIndex)
    }

/// <summary>
/// In Source engine, gets or sets the index of the <see cref="LibBSP.Displacement"/> used by this <see cref="BrushSide"/>.
/// This is never used since the brushes used to create Displacements are optimized out.
/// </summary>
    public get displacementIndex(): int {
        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this._data.buffer)
            return view.getInt32(8)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.getInt16(4)
        }

        return -1
    }

    public set displacementIndex(value: int) {
        if (this.mapType == MapType.Vindictus) {
            const view = new DataView(this._data.buffer)
            view.setInt32(8, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this._data.buffer)
            view.setInt16(4, value)
        }
    }

    /// <summary>
    /// Is this <see cref="BrushSide"/> a bevel?
    /// </summary>
    public get isBevel(): boolean {
        if (this.mapType == MapType.Vindictus) {
            return this._data[12] > 0
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return this._data[6] > 0
        }

        return false
    }

    public set isBevel(value: boolean) {
        if (this.mapType == MapType.Vindictus) {
            this._data[12] = (value ? 1 : 0)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            this._data[6] = (value ? 1 : 0)
        }
    }

    /// <summary>
    /// Is this <see cref="BrushSide"/> thin?
    /// </summary>
    public get isThin(): boolean {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source) && this.mapType != MapType.Vindictus) {
            return this._data[7] > 0
        }

        return false
    }

    public set isThin(value: boolean) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source) && this.mapType != MapType.Vindictus) {
            this._data[7] = (value ? 1 : 0)
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<BrushSide> {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        return new Lump<BrushSide>(data, BrushSide.GetStructLength(bsp.mapType, lumpInfo.version), bsp, lumpInfo)
    }

    public static GetStructLength(type: MapType, version: int): int {
        if (type == MapType.Vindictus) {
            return 16
        } else if (MapType.IsSubtypeOf(type, MapType.MOHAA)
            || type == MapType.Raven) {
            return 12
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)
            || MapType.IsSubtypeOf(type, MapType.Source)
            || type == MapType.SiN
            || type == MapType.Nightfire) {
            return 8
        } else if (MapType.IsSubtypeOf(type, MapType.Quake2)) {
            return 4
        }

        throw new Error(`Lump object BrushSide does not exist in map type ${type} or has not been implemented.`)
    }

    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Source)) {
            return 19
        } else if (MapType.IsSubtypeOf(type, MapType.Quake2)) {
            return 15
        } else if (MapType.IsSubtypeOf(type, MapType.STEF2)) {
            return 12
        } else if (MapType.IsSubtypeOf(type, MapType.MOHAA)) {
            return 11
        } else if (type == MapType.Nightfire) {
            return 16
        } else if (type == MapType.CoD || type == MapType.CoDDemo) {
            return 3
        } else if (type == MapType.CoD2
            || type == MapType.CoD4) {
            return 5
        } else if (MapType.IsSubtypeOf(type, MapType.FAKK2)) {
            return 10
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)) {
            return 9
        }

        return -1
    }

    protected ctorCopy(source: BrushSide, parent: ILump) {
        this._parent = parent

        if (parent?.bsp) {
            if (source.parent?.bsp && source.parent.bsp.mapType == parent.bsp.mapType && source.lumpVersion === parent.lumpInfo.version) {
                this._data = new Uint8Array(source._data)
                return
            } else {
                this._data = new Uint8Array(BrushSide.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source._parent?.bsp) {
                this._data = new Uint8Array(BrushSide.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this._data = new Uint8Array(BrushSide.GetStructLength(MapType.Undefined, 0))
            }
        }

        this.planeIndex = source.planeIndex
        this.textureIndex = source.textureIndex
        this.faceIndex = source.faceIndex
        this.displacementIndex = source.displacementIndex
        this.isBevel = source.isBevel
        this.isThin = source.isThin
    }
}