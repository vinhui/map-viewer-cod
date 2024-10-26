import {Lump} from '../../Common/Lumps/Lump'
import {BSP, LumpInfo, MapType} from '../BSP'
import {Texture} from '../Texture'
import {int} from '../../../../utils/number'

export class Textures extends Lump<Texture> {
    public get length(): int {
        if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake3)
            || this.bsp.mapType === MapType.Nightfire) {
            return super.length
        } else if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Source)) {
            let length = 0

            for (let i = 0; i < this._backingArray.length; ++i) {
                length += this._backingArray[i].name.length + 1
            }

            return length
        } else if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake)) {
            let length = 4 + (this._backingArray.length * 40)

            for (let i = 0; i < this._backingArray.length; ++i) {
                let texture = this._backingArray[i]
                if (texture.mipmapFullOffset > 0) {
                    let mipLength = 0

                    mipLength += Math.trunc(texture.dimensions.x * texture.dimensions.y)
                    mipLength += Math.trunc(texture.dimensions.x * texture.dimensions.y / 4)
                    mipLength += Math.trunc(texture.dimensions.x * texture.dimensions.y / 16)
                    mipLength += Math.trunc(texture.dimensions.x * texture.dimensions.y / 64)
                    if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.GoldSrc)) {
                        let paletteLength = texture.palette.length + 2
                        while (paletteLength % 4 !== 0) {
                            ++paletteLength
                        }
                        mipLength += paletteLength
                    }

                    length += mipLength
                }
            }

            return length
        }

        return 0
    }

    public static CreateFromData(data: Uint8Array, structLength: int, bsp: BSP, lumpInfo: LumpInfo = new LumpInfo()): Textures {
        if (!data || !bsp) {
            throw new Error('ArgumentNullException')
        }

        const c = new Textures(Texture, null, bsp, lumpInfo)
        c.fromData(data, structLength)
        return c
    }

    public fromData(data: Uint8Array, structLength: int) {
        const view = new DataView(data.buffer)

        if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake)) {
            let numElements = view.getInt32(0)
            structLength = 40
            let currentOffset: int
            let width: int
            let height: int
            let power: int
            let mipmapOffset = 0
            let paletteOffset: int

            for (let i = 0; i < numElements; ++i) {
                let myBytes: Uint8Array
                let mipmaps: Uint8Array[] = []
                let palette = new Uint8Array(0)
                currentOffset = view.getInt32((i + 1) * 4)
                if (currentOffset >= 0) {
                    myBytes = data.slice(currentOffset, currentOffset + structLength)
                    const myView = new DataView(myBytes.buffer)
                    width = myView.getInt32(16)
                    height = myView.getInt32(20)
                    power = 1

                    for (let j = 0; j < mipmaps.length; ++j) {
                        mipmapOffset = myView.getInt32(24 + (4 * j))
                        if (mipmapOffset > 0) {
                            const offset = currentOffset + mipmapOffset
                            mipmaps[j] = data.slice(offset, offset + (width / power) * (height / power))
                        }
                        power *= 2
                    }

                    if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.GoldSrc) && mipmapOffset > 0) {
                        paletteOffset = mipmapOffset + (width * height / 64)
                        const offset = currentOffset + paletteOffset
                        const numPixels = view.getInt16(offset)
                        palette = data.slice(offset, offset + numPixels * 3)
                    }
                }
                this._backingArray.push(Texture.CreateFromData(myBytes, this, mipmaps, palette))
            }

            return
        } else if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Source)) {
            let offset = 0

            for (let i = 0; i < data.length; ++i) {
                if (data[i] === 0x00) {
                    // They are null-terminated strings, of non-constant length (not padded)
                    const myBytes = data.slice(offset, i - offset)
                    this._backingArray.push(Texture.CreateFromData(myBytes, this))
                    offset = i + 1
                }
            }

            return
        } else if (this.bsp.mapType === MapType.Nightfire) {
            structLength = 64
        } else if (this.bsp.mapType === MapType.SiN) {
            structLength = 180
        } else if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.bsp.mapType, MapType.STEF2)
            || MapType.IsSubtypeOf(this.bsp.mapType, MapType.FAKK2)) {
            structLength = 76
        } else if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.MOHAA)) {
            structLength = 140
        } else if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake3)) {
            structLength = 72
        }

        let numObjects = data.length / structLength
        for (let i = 0; i < numObjects; ++i) {
            const bytes = data.slice(i * structLength, (i * structLength) + structLength)
            this._backingArray.push(Texture.CreateFromData(bytes, this))
        }
    }

    public getTextureAtOffset(offset: int): string {
        let current = 0
        for (let i = 0; i < this._backingArray.length; i++) {
            if (current < offset) {
                current += this._backingArray[i].name.length + 1
            } else {
                return this._backingArray[i].name
            }
        }
        return null
    }

    public getOffsetOf(name: string) {
        let offset = 0
        for (let i = 0; i < this._backingArray.length; i++) {
            if (this._backingArray[i].name.localeCompare(name, undefined, {sensitivity: 'base'}) === 0) {
                return offset
            } else {
                offset += this._backingArray[i].name.length + 1
            }
        }
        return -1
    }

    public getBytes(offset: int): Uint8Array {
        if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake3)
            || this.bsp.mapType === MapType.Nightfire) {
            return super.getBytes()
        } else if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Source)) {
            let sb = ''
            if (this._backingArray.length === 0) {
                return new Uint8Array(0)
            }

            for (let i = 0; i < this._backingArray.length; ++i) {
                sb += (this._backingArray[i].name) + String.fromCharCode(0x00)
            }

            return new TextEncoder().encode(sb)
        } else if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake)) {
            let textureBytes: Uint8Array[] = []

            let offset = 0
            for (let i = 0; i < this._backingArray.length; ++i) {
                let texture = this._backingArray[i]
                if (texture.mipmapFullOffset > 0) {
                    offset = 40
                    texture.mipmapFullOffset = offset
                    offset += Math.trunc(texture.dimensions.x * texture.dimensions.y)
                }
                if (texture.mipmapHalfOffset > 0) {
                    texture.mipmapHalfOffset = offset
                    offset += Math.trunc(texture.dimensions.x * texture.dimensions.y / 4)
                }
                if (texture.mipmapQuarterOffset > 0) {
                    texture.mipmapQuarterOffset = offset
                    offset += Math.trunc(texture.dimensions.x * texture.dimensions.y / 16)
                }
                if (texture.mipmapEighthOffset > 0) {
                    texture.mipmapEighthOffset = offset
                    offset += Math.trunc(texture.dimensions.x * texture.dimensions.y / 64)
                }

                if (texture.mipmapFullOffset > 0
                    || texture.mipmapHalfOffset > 0
                    || texture.mipmapQuarterOffset > 0
                    || texture.mipmapEighthOffset > 0) {
                    if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.GoldSrc)) {
                        let paletteLength = texture.palette.length + 2
                        while (paletteLength % 4 !== 0) {
                            ++paletteLength
                        }
                        offset += paletteLength
                    }

                    let bytes = new Uint8Array(offset)
                    offset = 0
                    bytes.set(texture.data, 0)
                    offset += 40
                    bytes.set(texture.mipmaps[Texture.FullMipmap], offset)
                    offset += Math.trunc(texture.dimensions.x * texture.dimensions.y)
                    bytes.set(texture.mipmaps[Texture.HalfMipmap], offset)
                    offset += Math.trunc(texture.dimensions.x * texture.dimensions.y / 4)
                    bytes.set(texture.mipmaps[Texture.QuarterMipmap], offset)
                    offset += Math.trunc(texture.dimensions.x * texture.dimensions.y / 16)
                    bytes.set(texture.mipmaps[Texture.EighthMipmap], offset)
                    if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.GoldSrc)) {
                        const view = new DataView(bytes.buffer)
                        offset += Math.trunc(texture.dimensions.x * texture.dimensions.y / 64)
                        view.setInt16(offset, texture.palette.length)
                        offset += 2
                        bytes.set(texture.palette, offset)
                    }

                    textureBytes[i] = bytes
                } else {
                    textureBytes[i] = texture.data
                }
            }

            let lumpBytes = new Uint8Array((this._backingArray.length + 1) * 4)
            const view = new DataView(lumpBytes.buffer)
            view.setInt32(0, this._backingArray.length)
            offset = lumpBytes.length
            for (let i = 0; i < this._backingArray.length; ++i) {
                if (this._backingArray[i].name.length === 0 && this._backingArray[i].mipmapFullOffset === 0) {
                    view.setInt32((i + 1) * 4, -1)
                } else {
                    view.setInt32((i + 1) * 4, offset)
                    let newLumpBytes = new Uint8Array(offset + textureBytes[i].length)
                    newLumpBytes.set(lumpBytes, 0)
                    newLumpBytes.set(textureBytes[i], offset)
                    offset = newLumpBytes.length
                    lumpBytes = newLumpBytes
                }
            }

            return lumpBytes
        }

        return new Uint8Array(0)
    }
}