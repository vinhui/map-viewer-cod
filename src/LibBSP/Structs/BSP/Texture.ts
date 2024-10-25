import {ILumpObject, LumpObjDataCtor} from '../Common/ILumpObject'
import {ILump} from '../Common/Lumps/ILump'
import {BSP, LumpInfo, MapType} from './BSP'
import {StringExtensions} from '../../Extensions/StringExtensions'
import {TextureInfo} from '../Common/TextureInfo'
import {Vector3Extensions} from '../../Extensions/Vector3Extensions'
import {Vector2} from '../../Util/Vector'
import {Textures} from './Lumps/Textures'
import {int} from '../../../utils/number'

export class Texture extends ILumpObject<Texture> {
    public static readonly NumMipmaps = 4
    public static readonly FullMipmap = 0
    public static readonly HalfMipmap = 1
    public static readonly QuarterMipmap = 2
    public static readonly EighthMipmap = 3

    private _mipmaps: Uint8Array[]
    public get mipmaps(): Uint8Array[] {
        if (!this._mipmaps && this.mipmapFullOffset >= 0) {
            const arr: Uint8Array[] = []
            for (let i = 0; i < Texture.NumMipmaps; i++) {
                arr.push(new Uint8Array(0))
            }
            this._mipmaps = arr
        }
        return this._mipmaps
    }

    private _palette: Uint8Array
    public get palette(): Uint8Array {
        return this._palette
    }

    public get name(): string {
        const mapType = this.mapType
        if (MapType.IsSubtypeOf(mapType, MapType.Quake)) {
            return StringExtensions.ToNullTerminatedString(this.data, 0, 16)
        } else if (mapType === MapType.SiN) {
            return StringExtensions.ToNullTerminatedString(this.data, 36, 64)
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake2)) {
            return StringExtensions.ToNullTerminatedString(this.data, 40, 32)
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake3)
            || mapType === MapType.Nightfire) {
            return StringExtensions.ToNullTerminatedString(this.data, 0, 64)
        } else if (MapType.IsSubtypeOf(mapType, MapType.Source) || mapType === MapType.Titanfall) {
            return StringExtensions.ToRawString(this.data)
        }

        return null
    }

    public set name(val: string) {
        let bytes = new TextEncoder().encode(val)

        const mapType = this.mapType
        if (MapType.IsSubtypeOf(mapType, MapType.Quake)) {
            for (let i = 0; i < 16; ++i) {
                this.data[i] = 0
            }
            if (bytes.length > 15) {
                bytes = bytes.slice(0, 15)
            }
            this.data.set(bytes, 0)
        } else if (mapType === MapType.SiN) {
            for (let i = 0; i < 64; ++i) {
                this.data[i + 36] = 0
            }
            if (bytes.length > 63) {
                bytes = bytes.slice(0, 63)
            }
            this.data.set(bytes, 36)
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake2)) {
            for (let i = 0; i < 32; ++i) {
                this.data[i + 40] = 0
            }
            if (bytes.length > 31) {
                bytes = bytes.slice(0, 31)
            }
            this.data.set(bytes, 40)
        } else if (MapType.IsSubtypeOf(mapType, MapType.Quake3)
            || mapType === MapType.Nightfire) {
            for (let i = 0; i < 64; ++i) {
                this.data[i] = 0
            }
            if (bytes.length > 63) {
                bytes = bytes.slice(0, 63)
            }
            this.data.set(bytes, 0)
        } else if (MapType.IsSubtypeOf(mapType, MapType.Source) || mapType === MapType.Titanfall) {
            this.data = bytes
        }
    }

    public get mask(): string {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            return StringExtensions.ToNullTerminatedString(this.data, 76, 64)
        }
        return null
    }

    public set mask(val: string) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.MOHAA)) {
            for (let i = 0; i < 64; i++) {
                this.data[i + 76] = 0
            }
            let bytes = new TextEncoder().encode(val)
            if (bytes.length > 63) {
                bytes = bytes.slice(0, 63)
            }
            this.data.set(bytes, 76)
        }
    }

    public get flags(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            return new DataView(this.data.buffer).getInt32(32)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            return new DataView(this.data.buffer).getInt32(64)
        }
        return -1
    }

    public set flags(val: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            new DataView(this.data.buffer).setInt32(32, val)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            new DataView(this.data.buffer).setInt32(64, val)
        }
    }

    public get contents(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            return new DataView(this.data.buffer).getInt32(68)
        }
        return -1
    }

    public set contents(val: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)) {
            new DataView(this.data.buffer).setInt32(68, val)
        }
    }

    public get textureInfo(): TextureInfo {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            const view = new DataView(this.data.buffer)

            return TextureInfo.CreateFromProps(
                Vector3Extensions.ToVector3(this.data),
                Vector3Extensions.ToVector3(this.data, 16),
                new Vector2(view.getFloat32(12), view.getFloat32(28)),
                new Vector2(1, 1),
                -1, -1, 0,
            )
        }

        return new TextureInfo(new LumpObjDataCtor(null, null))
    }

    public set textureInfo(val: TextureInfo) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            const view = new DataView(this.data.buffer)
            val.uAxis.getBytes(view, 0)
            val.vAxis.getBytes(view, 16)
            view.setFloat32(12, val.translation.x)
            view.setFloat32(28, val.translation.y)
        }
    }

    public get dimensions(): Vector2 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return new Vector2(
                view.getInt32(16),
                view.getInt32(20),
            )
        }
        return new Vector2()
    }

    public set dimensions(val: Vector2) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(16, val.x)
            view.setInt32(20, val.y)
        }
    }

    public get mipmapFullOffset(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(24)
        }
        return -1
    }

    public set mipmapFullOffset(val: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(24, val)
        }
    }

    public get mipmapHalfOffset(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(28)
        }
        return -1
    }

    public set mipmapHalfOffset(val: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(28, val)
        }
    }

    public get mipmapQuarterOffset(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(32)
        }
        return -1
    }

    public set mipmapQuarterOffset(val: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(32, val)
        }
    }

    public get paletteSize(): int {
        return this._palette.length / 3
    }

    public get mipmapEighthOffset(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(36)
        }
        return -1
    }

    public set mipmapEighthOffset(val: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, val)
        }
    }

    public get value(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2) && this.mapType !== MapType.SiN) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(36)
        }
        return 0
    }

    public set value(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2) && this.mapType !== MapType.SiN) {
            const view = new DataView(this.data.buffer)
            view.setInt32(36, value)
        }
    }

    public get next(): int {
        if (this.mapType === MapType.SiN) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(100)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(72)
        }
        return 0
    }

    public set next(value: int) {
        if (this.mapType === MapType.SiN) {
            const view = new DataView(this.data.buffer)
            view.setInt32(100, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(72, value)
        }
    }

    public get subdivisions(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.UberTools)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(72)
        }
        return 16
    }

    public set subdivisions(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.UberTools)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(72, value)
        }
    }


    public static CreateFromData(data: Uint8Array, parent: ILump, mipmaps?: Uint8Array[], palette?: Uint8Array): Texture {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const c = new Texture(new LumpObjDataCtor(data, parent))
        c._mipmaps = mipmaps
        c._palette = palette
        return c
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo) {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const c = new Textures(Texture, null, bsp, lumpInfo)
        c.fromData(data, Texture.GetStructLength(bsp.mapType, lumpInfo.version))
        return c
    }

    public static GetStructLength(type: MapType, version: int) {
        return -1
    }

    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.UberTools)
            || MapType.IsSubtypeOf(type, MapType.CoD)) {
            return 0
        } else if (MapType.IsSubtypeOf(type, MapType.Quake)
            || type === MapType.Nightfire) {
            return 2
        } else if (MapType.IsSubtypeOf(type, MapType.Quake2)) {
            return 5
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)) {
            return 1
        } else if (MapType.IsSubtypeOf(type, MapType.Source)
            || type === MapType.Titanfall) {
            return 43
        }

        return -1
    }

    public static GetIndexForMaterialLump(type: MapType): int {
        if (type === MapType.Nightfire) {
            return 3
        }
        return -1
    }

    public static SanitizeName(name: string, mapType: MapType): string {
        let sanitized = name.replace('\\', '/')
        sanitized = sanitized.replace('*', '#')

        if (MapType.IsSubtypeOf(mapType, MapType.Source)
            || mapType === MapType.Titanfall) {
            if (sanitized.length >= 5 && sanitized.substring(0, 5).localeCompare('maps/', undefined, {sensitivity: 'base'}) === 0) {
                sanitized = sanitized.substring(5)
                for (let i = 0; i < sanitized.length; ++i) {
                    if (sanitized[i] === '/') {
                        sanitized = sanitized.substring(i + 1)
                        break
                    }
                }
            }

            // Parse cubemap textures
            // TODO: Use regex? .{1,}(_-?[0-9]{1,}){3}$
            let numUnderscores = 0
            let validnumber = false
            for (let i = sanitized.length - 1; i > 0; --i) {
                if (sanitized[i] <= '9' && sanitized[i] >= '0') {
                    // Current is a number, this may be a cubemap reference
                    validnumber = true
                } else {
                    if (sanitized[i] === '-') {
                        // Current is a minus sign (-).
                        if (!validnumber) {
                            break // Make sure there's a number to add the minus sign to. If not, kill the loop.
                        }
                    } else {
                        if (sanitized[i] === '_') {
                            // Current is an underscore (_)
                            if (validnumber) {
                                // Make sure there is a number in the current string
                                ++numUnderscores // before moving on to the next one.
                                if (numUnderscores === 3) {
                                    // If we've got all our numbers
                                    sanitized = sanitized.substring(0, i) // Cut the texture string
                                }
                                validnumber = false
                            } else {
                                // No number after the underscore
                                break
                            }
                        } else {
                            // Not an acceptable character
                            break
                        }
                    }
                }
            }
        }

        return sanitized
    }

    protected ctorCopy(source: Texture, parent: ILump) {
        if (!parent?.bsp) {
            if (source.parent?.bsp && source.parent.bsp.mapType === parent.bsp.mapType && source.lumpVersion === parent.lumpInfo.version) {
                this.data = new Uint8Array(source.data)
                this._mipmaps = source.mipmaps
                this._palette = source.palette
                return this
            } else {
                this.data = new Uint8Array(Texture.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent?.bsp) {
                this.data = new Uint8Array(Texture.GetStructLength(source.parent.bsp.mapType, source.parent.lumpInfo.version))
            } else {
                this.data = new Uint8Array(Texture.GetStructLength(MapType.Undefined, 0))
            }
        }

        this._mipmaps = source.mipmaps
        this._palette = source.palette
        this.name = source.name
        this.mask = source.mask
        this.flags = source.flags
        this.contents = source.contents
        this.textureInfo = source.textureInfo
        this.dimensions = source.dimensions
        this.mipmapFullOffset = source.mipmapFullOffset
        this.mipmapHalfOffset = source.mipmapHalfOffset
        this.mipmapQuarterOffset = source.mipmapQuarterOffset
        this.mipmapEighthOffset = source.mipmapEighthOffset
        this.value = source.value
        this.next = source.next
        this.subdivisions = source.subdivisions
    }
}