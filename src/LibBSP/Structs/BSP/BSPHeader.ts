import {BSP, LumpInfo, MapType} from './BSP'
import {ILump} from '../Common/Lumps/ILump'
import {int, Int32} from '../../../utils/number'

export class BSPHeader {
    /// <summary>
    /// "IBSP" represented as 32.
    /// </summary>
    public static readonly IBSPHeader = 1347633737
    /// <summary>
    /// "RBSP" represented as 32.
    /// </summary>
    public static readonly RBSPHeader = 1347633746
    /// <summary>
    /// "VBSP" represented as 32.
    /// </summary>
    public static readonly VBSPHeader = 1347633750
    /// <summary>
    /// "EALA" represented as 32.
    /// </summary>
    public static readonly EALAHeader = 1095516485
    /// <summary>
    /// "2015" represented as 32.
    /// </summary>
    public static readonly MOHAAHeader = 892416050
    /// <summary>
    /// "EF2!" represented as 32.
    /// </summary>
    public static readonly EF2Header = 556942917
    /// <summary>
    /// "rBSP" represented as 32.
    /// </summary>
    public static readonly rBSPHeader = 1347633778
    /// <summary>
    /// "FAKK" represented as 32.
    /// </summary>
    public static readonly FAKKHeader = 1263223110

    public bsp: BSP
    public data: Uint8Array

    constructor(bsp: BSP, data: Uint8Array) {
        this.bsp = bsp
        this.data = data
    }

    public get length(): int {
        return this.data?.buffer?.byteLength ?? 0
    }

    public get revision(): int {
        if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.UberTools)) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(8)
        }
        return 0
    }

    public set revision(value: int) {
        if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.UberTools)) {
            const view = new DataView(this.data.buffer)
            view.setInt32(8, value)
        }
    }

    public static GetMagic(type: MapType): Uint8Array {
        let arr: Uint8Array
        switch (type) {
            case MapType.Quake:
                return numberToUint8Arr(29)
            case MapType.GoldSrc:
            case MapType.BlueShift:
                return numberToUint8Arr(30)
            case MapType.Quake2:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.IBSPHeader, arr, 0)
                return numberToUint8Arr(38, arr, 4)
            case MapType.Daikatana:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.IBSPHeader, arr, 0)
                return numberToUint8Arr(41, arr, 4)
            case MapType.SoF:
            case MapType.Quake3:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.IBSPHeader, arr, 0)
                return numberToUint8Arr(46, arr, 4)
            case MapType.SiN:
            case MapType.Raven:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.IBSPHeader, arr, 0)
                return numberToUint8Arr(1, arr, 4)
            case MapType.ET:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.IBSPHeader, arr, 0)
                return numberToUint8Arr(47, arr, 4)
            case MapType.CoD:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.IBSPHeader, arr, 0)
                return numberToUint8Arr(59, arr, 4)
            case MapType.CoDDemo:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.IBSPHeader, arr, 0)
                return numberToUint8Arr(58, arr, 4)
            case MapType.CoD2:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.IBSPHeader, arr, 0)
                return numberToUint8Arr(4, arr, 4)
            case MapType.CoD4:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.IBSPHeader, arr, 0)
                return numberToUint8Arr(22, arr, 4)
            case MapType.STEF2:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.EF2Header, arr, 0)
                return numberToUint8Arr(20, arr, 4)
            case MapType.STEF2Demo:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.FAKKHeader, arr, 0)
                return numberToUint8Arr(19, arr, 4)
            case MapType.MOHAA:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.MOHAAHeader, arr, 0)
                return numberToUint8Arr(19, arr, 4)
            case MapType.MOHAADemo:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.MOHAAHeader, arr, 0)
                return numberToUint8Arr(18, arr, 4)
            case MapType.MOHAABT:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.EALAHeader, arr, 0)
                return numberToUint8Arr(21, arr, 4)
            case MapType.FAKK2:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.FAKKHeader, arr, 0)
                return numberToUint8Arr(12, arr, 4)
            case MapType.Alice:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.FAKKHeader, arr, 0)
                return numberToUint8Arr(42, arr, 4)
            case MapType.Nightfire:
                return numberToUint8Arr(42)
            case MapType.Source17:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.VBSPHeader, arr, 0)
                return numberToUint8Arr(17, arr, 4)
            case MapType.Source18:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.VBSPHeader, arr, 0)
                return numberToUint8Arr(18, arr, 4)
            case MapType.Source19:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.VBSPHeader, arr, 0)
                return numberToUint8Arr(19, arr, 4)
            case MapType.Source20:
            case MapType.Vindictus:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.VBSPHeader, arr, 0)
                return numberToUint8Arr(20, arr, 4)
            case MapType.DMoMaM:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.VBSPHeader, arr, 0)
                return numberToUint8Arr(262164, arr, 4)
            case MapType.Source21:
            case MapType.L4D2:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.VBSPHeader, arr, 0)
                return numberToUint8Arr(21, arr, 4)
            case MapType.Source22:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.VBSPHeader, arr, 0)
                return numberToUint8Arr(22, arr, 4)
            case MapType.Source23:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.VBSPHeader, arr, 0)
                return numberToUint8Arr(23, arr, 4)
            case MapType.Titanfall:
                arr = new Uint8Array(8)
                numberToUint8Arr(this.rBSPHeader, arr, 0)
                return numberToUint8Arr(29, arr, 4)
        }

        return new Uint8Array(0)
    }

    public static GetLumpInfoLength(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Source21)) {
            return 16
        }

        return 8
    }

    public regenerate(): BSPHeader {
        if (this.bsp && this.bsp.mapType !== MapType.Undefined) {
            const lumpInfoLength = BSPHeader.GetLumpInfoLength(this.bsp.mapType)
            const numLumps = BSP.GetNumLumps(this.bsp.mapType)
            const magic: Uint8Array = BSPHeader.GetMagic(this.bsp.mapType)
            let revision = this.revision

            if (this.bsp.mapType === MapType.CoD4) {
                let numActualLumps = 0
                let lumpOffset = magic.length + 4

                let lumpInfos: Map<int, LumpInfo> = new Map()
                for (let i = 0; i < BSP.GetNumLumps(MapType.CoD4); i++) {
                    const lumpInfo = this.getLumpInfo(i)

                    let lumpLength: int
                    const lump = this.bsp.getLoadedLump(lumpInfo.ident)
                    if (lump !== null) {
                        lumpLength = lump.length
                    } else {
                        lumpLength = lumpInfo.length
                    }

                    if (lumpLength > 0) {
                        lumpInfo.offset = lumpOffset
                        lumpInfo.length = lumpLength
                        lumpOffset += lumpLength

                        lumpInfos.set(i, lumpInfo)
                        numActualLumps++
                    }
                }

                const newData = new Uint8Array(lumpOffset + lumpInfoLength * numActualLumps)
                const newDataView = new DataView(newData.buffer)
                newData.set(magic, 0)
                newDataView.setInt32(numActualLumps, 8)
                let offset = magic.length + 4
                for (let [key, value] of lumpInfos.entries()) {
                    newDataView.setInt32(offset, key)
                    newDataView.setInt32(offset + 4, offset)
                    offset += 8
                }

                return new BSPHeader(this.bsp, newData)
            } else {
                let offset: int
                let newData: Uint8Array
                if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.UberTools)) {
                    offset = magic.length + 4
                    newData = new Uint8Array(offset + lumpInfoLength * numLumps)
                    revision = this.revision + 1
                } else {
                    offset = magic.length
                    newData = new Uint8Array(offset + lumpInfoLength * numLumps)
                }
                newData.set(magic, 0)
                const newDataView = new DataView(newData.buffer)
                let lumpOffset = newData.length

                for (let i = 0; i < numLumps; i++) {
                    let lumpLength: int
                    let lumpVersion: int
                    let lumpIdent: int

                    let lump: ILump = this.bsp.getLoadedLump(i)
                    if (lump !== null) {
                        lumpLength = lump.length
                        lumpVersion = this.bsp[i].version
                        lumpIdent = this.bsp[i].ident
                    } else {
                        const lumpInfo: LumpInfo = this.getLumpInfo(i)
                        lumpLength = lumpInfo.length
                        lumpVersion = lumpInfo.version
                        lumpIdent = lumpInfo.ident
                    }

                    if (this.bsp.mapType === MapType.L4D2 || this.bsp.mapType === MapType.Source27) {
                        newDataView.setInt32(lumpVersion, offset)
                        if (lumpLength > 0) {
                            newDataView.setInt32(lumpOffset, offset + 4)
                        }
                        newDataView.setInt32(lumpLength, offset + 8)
                        newDataView.setInt32(lumpIdent, offset + 12)
                    } else if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Source)) {
                        if (lumpLength > 0) {
                            newDataView.setInt32(lumpOffset, offset)
                        }
                        newDataView.setInt32(lumpLength, offset + 4)
                        newDataView.setInt32(lumpVersion, offset + 8)
                        newDataView.setInt32(lumpIdent, offset + 12)
                    } else if (this.bsp.mapType === MapType.CoD || this.bsp.mapType === MapType.CoD2) {
                        newDataView.setInt32(lumpLength, offset)
                        newDataView.setInt32(lumpOffset, offset + 4)
                    } else {
                        if (lumpLength > 0) {
                            newDataView.setInt32(lumpOffset, offset)
                        }
                        newDataView.setInt32(lumpLength, offset + 4)
                    }

                    offset += BSPHeader.GetLumpInfoLength(this.bsp.mapType)
                    lumpOffset += lumpLength
                }
                return new BSPHeader(this.bsp, newData)
            }
        } else {
            return new BSPHeader(this.bsp, new Uint8Array(0))
        }
    }

    public getLumpInfo(index: int): LumpInfo {
        if (index < 0 || index > BSP.GetNumLumps(this.bsp.mapType)) {
            throw new Error('Index out of range')
        }

        const lumpInfoLength = BSPHeader.GetLumpInfoLength(this.bsp.mapType)
        if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake) || this.bsp.mapType === MapType.Nightfire) {
            return this.getLumpInfoAtOffset(4 + lumpInfoLength * index)
        } else if (
            MapType.IsSubtypeOf(this.bsp.mapType, MapType.STEF2)
            || MapType.IsSubtypeOf(this.bsp.mapType, MapType.MOHAA)
            || MapType.IsSubtypeOf(this.bsp.mapType, MapType.FAKK2)
        ) {
            return this.getLumpInfoAtOffset(12 + lumpInfoLength * index)
        } else if (this.bsp.mapType === MapType.Titanfall) {
            const lumpFileInfo: LumpInfo = this.bsp.reader.getLumpFileLumpInfo(index)
            if (lumpFileInfo.lumpFile !== null) {
                return lumpFileInfo
            }
            return this.getLumpInfoAtOffset(lumpInfoLength * (index + 1))
        } else if (this.bsp.mapType === MapType.CoD4) {
            const view = new DataView(this.data.buffer)
            const numlumps = view.getInt32(8)
            let offset = 12
            let lumpOffset = offset + numlumps * 8
            for (let i = 0; i < numlumps; i++) {
                const id = view.getInt32(offset)
                const length = view.getInt32(offset + 4)
                if (id === index) {
                    const l = new LumpInfo()
                    l.ident = id
                    l.offset = lumpOffset
                    l.length = length
                    return l
                } else {
                    lumpOffset += length
                    while (lumpOffset % 4 !== 0) {
                        lumpOffset++
                    }
                }
                offset += 8
            }

            return new LumpInfo()
        } else if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Source)) {
            const lumpFileInfo: LumpInfo = this.bsp.reader.getLumpFileLumpInfo(index)
            if (lumpFileInfo.lumpFile !== null) {
                return lumpFileInfo
            }

            return this.getLumpInfoAtOffset(8 + lumpInfoLength * index)
        } else if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake2) || MapType.IsSubtypeOf(this.bsp.mapType, MapType.Quake3)) {
            return this.getLumpInfoAtOffset(8 + lumpInfoLength * index)
        }

        return new LumpInfo()
    }

    private getLumpInfoAtOffset(offset: int): LumpInfo {
        const lumpInfoLength = BSPHeader.GetLumpInfoLength(this.bsp.mapType)
        if (this.data.byteLength < offset + lumpInfoLength) {
            return new LumpInfo()
        }

        let lumpOffset: int
        let lumpLength: int
        let lumpVersion = 0
        let lumpIdent = 0
        const view = new DataView(this.data.buffer)
        if (this.bsp.mapType === MapType.L4D2 || this.bsp.mapType === MapType.Source27) {
            lumpVersion = view.getInt32(offset)
            lumpOffset = view.getInt32(offset + 4)
            lumpLength = view.getInt32(offset + 8)
            lumpIdent = view.getInt32(offset + 12)
        } else if (MapType.IsSubtypeOf(this.bsp.mapType, MapType.Source27)) {
            lumpOffset = view.getInt32(offset)
            lumpLength = view.getInt32(offset + 4)
            lumpVersion = view.getInt32(offset + 8)
            lumpIdent = view.getInt32(offset + 12)
        } else if (this.bsp.mapType === MapType.CoD || this.bsp.mapType === MapType.CoD2) {
            lumpLength = view.getInt32(offset)
            lumpOffset = view.getInt32(offset + 4)
        } else {
            lumpOffset = view.getInt32(offset)
            lumpLength = view.getInt32(offset + 4)
        }

        const l = new LumpInfo()
        l.offset = lumpOffset
        l.length = lumpLength
        l.version = lumpVersion
        l.ident = lumpIdent
        return l
    }
}

function numberToUint8Arr(num: Int32, arr?: Uint8Array, offset?: int): Uint8Array {
    if (!arr) {
        arr = new Uint8Array(4)
    }
    const dv = new DataView(arr.buffer)
    dv.setInt32(num, offset ?? 0)
    return arr
}