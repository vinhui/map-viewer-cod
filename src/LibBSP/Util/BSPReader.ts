import {BSP, LumpInfo, MapType} from '../Structs/BSP/BSP'
import {BSPHeader} from '../Structs/BSP/BSPHeader'
import {BinaryReader} from '../../utils/BinaryReader'
import {int} from '../../utils/number'
import {FakeFileSystem} from '../FakeFileSystem'

export class BSPReader {
    public bspFile: string
    private entityPattern = '"classname"'
    private lumpFiles: Map<int, LumpInfo>
    private key: Uint8Array = new Uint8Array(0)

    constructor(file?: string) {
        if (!FakeFileSystem.FileExists(file)) {
            throw new Error(`Unable to open BSP file: File ${file} was not found.`)
        }
        this.bspFile = file
    }

    public getHeader(mapType: MapType): Uint8Array {
        if (!this.bspFile) {
            return null
        }
        if (mapType === MapType.CoD4) {
            const lumpInfoLength = BSPHeader.GetLumpInfoLength(mapType)
            const magicLength = BSPHeader.GetMagic(mapType).length

            const bytes = FakeFileSystem.ReadFile(this.bspFile)
            const binaryReader = new BinaryReader(bytes)
            binaryReader.seek(magicLength)
            const numLumps = binaryReader.readInt32()
            const length = magicLength + 4 + lumpInfoLength * numLumps
            binaryReader.seek(0)
            return binaryReader.readBytes(length)
        } else {
            const lumpInfoLength = BSPHeader.GetLumpInfoLength(mapType)
            const numLumps = BSP.GetNumLumps(mapType)
            const magicLength = BSPHeader.GetMagic(mapType).length

            let length = magicLength + lumpInfoLength * numLumps
            if (MapType.IsSubtypeOf(mapType, MapType.UberTools)) {
                length += 4
            }

            let bytes = FakeFileSystem.ReadFile(this.bspFile)
            bytes = bytes.slice(0, length)

            if (mapType === MapType.TacticalInterventionEncrypted) {
                bytes = this.XorWithKeyStartingAtIndex(bytes)
            }
            return bytes
        }
    }

    public readLump(info: LumpInfo): Uint8Array {
        if (info.length === 0) {
            return new Uint8Array(0)
        }
        let output: Uint8Array
        if (info.lumpFile) {
            output = this.readLumpFile(info.offset, info.length, info.lumpFile)
        } else {
            output = this.readLumpFile(info.offset, info.length)
        }

        if (this.key.length !== 0) {
            output = this.XorWithKeyStartingAtIndex(output, info.offset)
        }
        return output
    }

    public readLumpFile(offset: int, length: int, filename?: string): Uint8Array {
        if (!filename || filename === '') {
            if (!this.bspFile) {
                return null
            }
            filename = this.bspFile
        }

        if (!FakeFileSystem.FileExists(filename)) {
            throw new Error(`Lump file ${filename} doesn't exist`)
        }

        const bytes = FakeFileSystem.ReadFile(filename)
        return bytes.slice(offset, offset + length)
    }

    public getLumpFileLumpInfo(index: int): LumpInfo {
        if (!this.lumpFiles) {
            this.loadLumpFiles()
        }

        if (this.lumpFiles.has(index)) {
            return this.lumpFiles.get(index)
        }
        return new LumpInfo()
    }

    public getVersion(bigEndian: boolean = false): MapType {
        let current = MapType.Undefined
        if (this.bspFile) {
            const bytes = FakeFileSystem.ReadFile(this.bspFile)

            if (bytes.length < 4) {
                return current
            }

            const binaryReader = new BinaryReader(bytes, !bigEndian)
            binaryReader.seek(0)
            const num = binaryReader.readInt32()
            switch (num) {
                case BSPHeader.IBSPHeader:
                    const num2 = binaryReader.readInt32()
                    switch (num2) {
                        case 4:
                            current = MapType.CoD2
                            break
                        case 22:
                            current = MapType.CoD4
                            break
                        case 38:
                            current = MapType.Quake2
                            break
                        case 41:
                            current = MapType.Daikatana
                            break
                        case 46:
                            current = MapType.Quake3

                            for (let i = 0; i < 17; i++) {
                                binaryReader.seek((i + 1) * 8)
                                const temp = binaryReader.readInt32()
                                if (temp === 184) {
                                    current = MapType.SoF
                                    break
                                } else if (temp === 144) {
                                    break
                                }
                            }
                            break
                        case 47:
                            current = MapType.ET
                            break
                        case 58:
                            current = MapType.CoDDemo
                            break
                        case 59:
                            current = MapType.CoD
                    }
                    break
                case BSPHeader.MOHAAHeader:
                    const num3 = binaryReader.readInt32()
                    if (num3 === 18) {
                        current = MapType.MOHAADemo
                    } else {
                        current = MapType.MOHAA
                    }
                    break
                case BSPHeader.EALAHeader:
                    current = MapType.MOHAABT
                    break
                case BSPHeader.VBSPHeader:
                    const num4 = binaryReader.readUInt16()
                    switch (num4) {
                        case 17:
                            current = MapType.Source17
                            break
                        case 18:
                            current = MapType.Source18
                            break
                        case 19:
                            current = MapType.Source19
                            break
                        case 20:
                            const version2 = binaryReader.readUInt16()
                            if (version2 === 4) {
                                current = MapType.DMoMaM
                            } else {
                                current = MapType.Source20
                                binaryReader.seek(568)
                                const gameLumpOffset = binaryReader.readInt32()
                                binaryReader.seek(gameLumpOffset)
                                const numGameLumps = binaryReader.readInt32()
                                if (numGameLumps > 0) {
                                    binaryReader.seek(gameLumpOffset + 12)
                                    const testOffset = binaryReader.readInt32()
                                    if (numGameLumps > 0) {
                                        if (testOffset < 24) {
                                            current = MapType.Vindictus
                                            break
                                        }
                                    }
                                }
                            }
                            break
                        case 21:
                            current = MapType.Source21
                            binaryReader.seek(0)
                            const test = binaryReader.readInt32()
                            if (test < 1032) {
                                current = MapType.L4D2
                            }
                            break
                        case 22:
                            current = MapType.Source22
                            break
                        case 23:
                            current = MapType.Source23
                            break
                        case 27:
                            current = MapType.Source27
                            break
                    }
                    break
                case BSPHeader.RBSPHeader:
                    current = MapType.Raven

                    for (let i = 0; i < 17; i++) {
                        binaryReader.seek((i + 1) * 8)
                        const temp = binaryReader.readInt32()
                        if (temp === 168) {
                            current = MapType.SiN
                            break
                        } else if (temp === 152) {
                            break
                        }
                    }
                    break
                case BSPHeader.EF2Header:
                    current = MapType.STEF2
                    break
                case BSPHeader.rBSPHeader:
                    current = MapType.Titanfall
                    break
                case BSPHeader.FAKKHeader:
                    const num6 = binaryReader.readInt32()
                    switch (num6) {
                        case 12:
                            current = MapType.FAKK2
                            break
                        case 19:
                            current = MapType.STEF2Demo
                            break
                        case 42:
                            current = MapType.Alice
                    }
                    break
                case 29:
                    current = MapType.Quake
                    break
                case 30:
                    current = MapType.BlueShift
                    binaryReader.seek(4)
                    const lump0offset = binaryReader.readInt32()
                    const lump0length = binaryReader.readInt32()
                    binaryReader.seek(lump0offset)
                    let currentChar: string
                    let patternMatch = 0
                    for (let i = 0; i < lump0length - this.entityPattern.length; i++) {
                        currentChar = binaryReader.readString(1)
                        if (currentChar === this.entityPattern[patternMatch]) {
                            patternMatch++
                            if (patternMatch === this.entityPattern.length) {
                                current = MapType.GoldSrc
                                break
                            }
                        } else {
                            patternMatch = 0
                        }
                    }
                    break
                case 42:
                    current = MapType.Nightfire
                    break
                default:
                    binaryReader.seek(384)
                    this.key = binaryReader.readBytes(32)
                    binaryReader.seek(0)
                    const arr = this.XorWithKeyStartingAtIndex(binaryReader.readBytes(4))
                    const view = new DataView(arr.buffer)
                    const num7 = view.getInt32(0)
                    if (num7 === BSPHeader.VBSPHeader) {
                        current = MapType.TacticalInterventionEncrypted
                    } else {
                        current = MapType.Undefined
                    }
                    break
            }
            return current
        }
    }

    private loadLumpFiles() {
        this.lumpFiles = new Map()
        if (!this.bspFile) {
            return
        }

        const baseName = this.bspFile.substring(0, this.bspFile.length - 4)

        const files = FakeFileSystem.GetFilesInDirectory(baseName, /_._.*\.lmp/)
        files.sort((f1, f2) => {
            const startIndex = this.bspFile.split('/').pop().length - 1
            const f1EndIndex = f1.lastIndexOf('.')
            const f2EndIndex = f2.lastIndexOf('.')
            const f1Position = parseInt(f1.split('/').pop().substring(startIndex, f1EndIndex - startIndex), 10)
            const f2Position = parseInt(f2.split('/').pop().substring(startIndex, f2EndIndex - startIndex), 10)
            return f1Position - f2Position
        })

        for (let file of files) {
            const bytes = FakeFileSystem.ReadFile(file)
            const br = new BinaryReader(bytes)
            const l = new LumpInfo()
            l.offset = br.readInt32()
            const lumpIndex = br.readInt32()
            l.version = br.readInt32()
            l.length = br.readInt32()
            l.lumpFile = file
            this.lumpFiles.set(lumpIndex, l)
        }
    }

    private XorWithKeyStartingAtIndex(data: Uint8Array, index: int = 0): Uint8Array {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        if (this.key.length === 0 || data.length === 0) {
            return data
        }
        const output = new Uint8Array(data.length)
        for (let i = 0; i < data.length; i++) {
            output[i] = (data[i] ^ this.key[(i + index) % this.key.length])
        }
        return output
    }
}