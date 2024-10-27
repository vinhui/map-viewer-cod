import {ILump} from './ILump'
import {BSP, LumpInfo, MapType} from '../../BSP/BSP'
import {int, long} from '../../../../utils/number'

export enum DataType {
    Invalid = 0,
    SByte = 1,
    Byte = 2,
    Int16 = 3,
    UInt16 = 4,
    Int32 = 5,
    UInt32 = 6,
    Int64 = 7,
}

export class NumList implements ILump {
    public bsp: BSP
    public lumpInfo: LumpInfo
    public data: Uint8Array

    constructor(type: DataType, bsp?: BSP, lumpInfo: LumpInfo = new LumpInfo()) {
        this.bsp = bsp
        this.lumpInfo = lumpInfo
        this._type = type

        this.data = new Uint8Array(0)
    }

    private _type: DataType

    public get type(): DataType {
        return this._type
    }

    public get length(): int {
        return this.data.byteLength
    }

    public get structLength(): int {
        switch (this._type) {
            case DataType.Byte:
            case DataType.SByte: {
                return 1
            }
            case DataType.UInt16:
            case DataType.Int16: {
                return 2
            }
            case DataType.UInt32:
            case DataType.Int32: {
                return 4
            }
            case DataType.Int64: {
                return 8
            }
            default: {
                return 0
            }
        }
    }

    public get count(): int {
        return this.data.length + this.structLength
    }

    public static CreateCopy(original: NumList, type: DataType, bsp?: BSP, lumpInfo: LumpInfo = new LumpInfo()) {
        const c = new NumList(type, bsp, lumpInfo)
        c.data = new Uint8Array(original.data)
        return c
    }

    public static CreateFromData(data: Uint8Array, type: DataType, bsp?: BSP, lumpInfo: LumpInfo = new LumpInfo()) {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const c = new NumList(type, bsp, lumpInfo)
        c.data = data
        return c
    }

    public static LumpFactory(data: Uint8Array, type: DataType, bsp?: BSP, lumpInfo: LumpInfo = new LumpInfo()): NumList {
        return this.CreateFromData(data, type, bsp, lumpInfo)
    }

    public static GetIndexForLeafFacesLump(version: MapType): { index: int, type: DataType } {
        if (version === MapType.Nightfire) {
            return {
                type: DataType.UInt32,
                index: 12,
            }
        } else if (version === MapType.Vindictus) {
            return {
                type: DataType.UInt32,
                index: 16,
            }
        } else if (MapType.IsSubtypeOf(version, MapType.Quake)) {
            return {
                type: DataType.UInt16,
                index: 11,
            }
        } else if (version === MapType.CoD
            || version === MapType.CoDDemo
        ) {
            return {
                type: DataType.UInt32,
                index: 23,
            }
        } else if (MapType.IsSubtypeOf(version, MapType.Quake2)) {
            return {
                type: DataType.UInt16,
                index: 9,
            }
        } else if (MapType.IsSubtypeOf(version, MapType.STEF2)) {
            return {
                type: DataType.UInt32,
                index: 9,
            }
        } else if (MapType.IsSubtypeOf(version, MapType.FAKK2)
            || MapType.IsSubtypeOf(version, MapType.MOHAA)) {
            return {
                type: DataType.Int32,
                index: 7,
            }
        } else if (MapType.IsSubtypeOf(version, MapType.Source)) {
            return {
                type: DataType.UInt16,
                index: 16,
            }
        } else if (MapType.IsSubtypeOf(version, MapType.Quake3)) {
            return {
                type: DataType.Int32,
                index: 5,
            }
        }

        return {
            type: DataType.Invalid,
            index: -1,
        }
    }

    public static GetIndexForFaceEdgesLump(version: MapType): { index: int, type: DataType } {
        if (MapType.IsSubtypeOf(version, MapType.Quake2)) {
            return {
                type: DataType.Int32,
                index: 12,
            }
        } else if (MapType.IsSubtypeOf(version, MapType.Quake)
            || MapType.IsSubtypeOf(version, MapType.Source)) {
            return {
                type: DataType.Int32,
                index: 13,
            }
        }

        return {
            type: DataType.Invalid,
            index: -1,
        }
    }

    public static GetIndexForLeafBrushesLump(version: MapType): { index: int, type: DataType } {
        if (version === MapType.Nightfire) {
            return {
                type: DataType.UInt32,
                index: 13,
            }
        } else if (MapType.IsSubtypeOf(version, MapType.STEF2)) {
            return {
                type: DataType.UInt32,
                index: 8,
            }
        } else if (MapType.IsSubtypeOf(version, MapType.Quake2)) {
            return {
                type: DataType.UInt16,
                index: 10,
            }
        } else if (version === MapType.Vindictus) {
            return {
                type: DataType.UInt32,
                index: 17,
            }
        } else if (version === MapType.CoD
            || version === MapType.CoDDemo) {
            return {
                type: DataType.UInt32,
                index: 22,
            }
        } else if (version === MapType.CoD2) {
            return {
                type: DataType.UInt32,
                index: 27,
            }
        } else if (version === MapType.CoD4) {
            return {
                type: DataType.UInt32,
                index: 29,
            }
        } else if (MapType.IsSubtypeOf(version, MapType.Source)) {
            return {
                type: DataType.UInt16,
                index: 17,
            }
        } else if (MapType.IsSubtypeOf(version, MapType.Quake3)) {
            return {
                type: DataType.UInt32,
                index: 6,
            }
        }

        return {
            type: DataType.Invalid,
            index: -1,
        }
    }

    public static GetIndexForIndicesLump(version: MapType): { index: int, type: DataType } {
        if (version === MapType.Nightfire) {
            return {
                type: DataType.UInt32,
                index: 6,
            }
        } else if (version === MapType.CoD
            || version === MapType.CoDDemo) {
            return {
                type: DataType.UInt16,
                index: 8,
            }
        } else if (version === MapType.CoD2) {
            return {
                type: DataType.UInt16,
                index: 9,
            }
        } else if (version === MapType.CoD4) {
            return {
                type: DataType.UInt16,
                index: 11,
            }
        } else if (MapType.IsSubtypeOf(version, MapType.FAKK2)
            || MapType.IsSubtypeOf(version, MapType.MOHAA)) {
            return {
                type: DataType.UInt32,
                index: 5,
            }
        } else if (MapType.IsSubtypeOf(version, MapType.STEF2)) {
            return {
                type: DataType.UInt32,
                index: 7,
            }
        } else if (MapType.IsSubtypeOf(version, MapType.Quake3)) {
            return {
                type: DataType.UInt32,
                index: 11,
            }
        }

        return {
            type: DataType.Invalid,
            index: -1,
        }
    }

    public static GetIndexForPatchIndicesLump(version: MapType): { index: int, type: DataType } {
        if (version === MapType.CoD
            || version === MapType.CoDDemo) {
            return {
                type: DataType.UInt32,
                index: 23,
            }
        }
        return {
            type: DataType.Invalid,
            index: -1,
        }
    }

    public static GetIndexForLeafPatchesLump(version: MapType): { index: int, type: DataType } {
        if (version === MapType.CoD || version === MapType.CoDDemo) {
            return {
                type: DataType.UInt32,
                index: 26,
            }
        }
        return {
            type: DataType.Invalid,
            index: -1,
        }
    }

    public static GetIndexForLeafStaticModelsLump(version: MapType): { index: int, type: DataType } {

        if (version === MapType.MOHAADemo) {
            return {
                type: DataType.UInt16,
                index: 27,
            }
        } else if (MapType.IsSubtypeOf(version, MapType.MOHAA)) {
            return {
                type: DataType.UInt16,
                index: 26,
            }
        }

        return {
            type: DataType.Invalid,
            index: -1,
        }
    }

    public static GetIndexForTexTableLump(version: MapType): { index: int, type: DataType } {
        if (MapType.IsSubtypeOf(version, MapType.Source)
            || version === MapType.Titanfall) {
            return {
                type: DataType.Int32,
                index: 44,
            }
        }
        return {
            type: DataType.Invalid,
            index: -1,
        }
    }

    public static GetIndexForDisplacementTrianglesLump(version: MapType): { index: int, type: DataType } {
        if (MapType.IsSubtypeOf(version, MapType.Source)) {
            return {
                type: DataType.UInt16,
                index: 48,
            }
        }
        return {
            type: DataType.Invalid,
            index: -1,
        }
    }

    public getBytes(lumpOffset: int = 0): Uint8Array {
        return this.data
    }

    public get(index: int): long {
        if (index >= this.count) {
            throw new Error('IndexOutOfRangeException')
        }
        const view = new DataView(this.data.buffer)
        switch (this._type) {
            case DataType.SByte:
                return BigInt(view.getUint8(index))
            case DataType.Byte:
                return BigInt(view.getUint8(index))
            case DataType.Int16:
                return BigInt(view.getInt16(index * 2, true))
            case DataType.UInt16:
                return BigInt(view.getUint16(index * 2, true))
            case DataType.Int32:
                return BigInt(view.getInt32(index * 4, true))
            case DataType.UInt32:
                return BigInt(view.getUint32(index * 4, true))
            case DataType.Int64:
                return view.getBigInt64(index * 8, true)
            default:
                return BigInt(0)
        }
    }

    public set(index: int, value: long) {
        const arr = new Uint8Array(8)
        const view = new DataView(arr.buffer)
        view.setBigInt64(0, value, true)
        this.data.set(arr.slice(0, this.structLength), index)
    }

    public add(value: long) {
        const temp = new Uint8Array(this.data.length + this.structLength)
        temp.set(this.data, 0)
        const bytes = new Uint8Array(8)
        const view = new DataView(bytes.buffer)
        view.setBigInt64(0, value, true)
        temp.set(bytes.slice(this.structLength), this.data.length)
        this.data = temp
    }

    public contains(value: long): boolean {
        for (const x of this) {
            if (value === x) {
                return true
            }
        }
        return false
    }

    public copyTo(other: long[], startIndex: int) {
        for (let i = 0; i < this.count; i++) {
            other[i + startIndex] = this.get(i)
        }
    }

    public remove(value: long): boolean {
        for (let i = 0; i < this.count; i++) {
            if (this.get(i) === value) {
                this.removeAt(i)
                return true
            }
        }
        return false
    }

    public removeAt(index: int) {
        const temp = new Uint8Array(this.data.length - this.structLength)
        temp.set(this.data.slice(0, this.structLength * index), 0)
        temp.set(this.data.slice(this.structLength * (index + 1)), this.structLength * index)
        this.data = temp
    }

    public [Symbol.iterator]() {
        let index = -1

        return {
            next: () => {
                return {
                    value: this.get(++index),
                    done: index >= this.count,
                }
            },
        }
    }

    public clear() {
        this.data = new Uint8Array(0)
    }

    public removeAll() {
        this.clear()
    }
}