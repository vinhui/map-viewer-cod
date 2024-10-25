import {ILump} from './ILump'
import {BSP, LumpInfo} from '../../BSP/BSP'
import {ILumpObject} from '../ILumpObject'
import {Vector2, Vector3, Vector4} from '../../../Utils/Vector'
import {Vertex} from '../Vertex'
import {VertexExtensions} from '../../../Extensions/VertexExtensions'
import {Plane} from '../../../Utils/Plane'
import {PlaneExtensions} from '../../../Extensions/PlaneExtensions'
import {byte} from '../../../../utils/number'

export class Lump<T> implements ILump {
    public bsp: BSP
    protected _backingArray: T[] = []
    private _TConstructor: { new(data: Uint8Array, parent: ILump): T; }

    constructor(TConstructor: {
        new(data: Uint8Array, parent: ILump): T;
    }, items?: T[], bsp?: BSP, lumpInfo: LumpInfo = new LumpInfo()) {
        this._TConstructor = TConstructor
        this._backingArray = items ?? []

        this.bsp = bsp
        this._lumpInfo = lumpInfo
    }

    protected _lumpInfo: LumpInfo

    public get lumpInfo(): LumpInfo {
        return this._lumpInfo
    }

    public get count(): int {
        return this._backingArray.length
    }

    public get length(): int {
        if (this._backingArray.length > 0) {
            const firstItem = this._backingArray[0]

            let count = this.count
            if (ILumpObject.IsInstanceOf(firstItem)) {
                return firstItem.data.byteLength * count
            } else if (firstItem instanceof Vertex) {
                return VertexExtensions.GetStructLength(this.bsp.mapType, this.lumpInfo.version) * count
            } else if (firstItem instanceof Plane) {
                return PlaneExtensions.GetStructLength(this.bsp.mapType, this.lumpInfo.version) * count
            } else if (firstItem instanceof Vector2) {
                return 8 * count
            } else if (firstItem instanceof Vector3) {
                return 12 * count
            } else if (firstItem instanceof Vector4) {
                return 16 * count
            } else if (typeof firstItem === 'number') {
                return count
            }
        }

        return 0
    }

    public getBytes(lumpOffset: int = 0): Uint8Array {
        let data: Uint8Array

        let count = this.count
        if (count > 0) {
            const firstItem = this._backingArray[0]

            if (ILumpObject.IsInstanceOf(this._backingArray)) {
                const arr = this._backingArray as ILumpObject[]

                const length = arr[0].data.byteLength
                data = new Uint8Array(length * count)
                for (let i = 0; i < count; i++) {
                    data.set(new Uint8Array(arr[i].data.buffer), length * i)
                }
            } else if (firstItem instanceof Vertex) {
                const arr = this._backingArray as Vertex[]
                const length = VertexExtensions.GetStructLength(this.bsp.mapType, this._lumpInfo.version)
                data = new Uint8Array(length * count)
                for (let i = 0; i < count; i++) {
                    VertexExtensions.GetBytes(arr[i], this.bsp.mapType, this.lumpInfo.version, data, length * i)
                }
            } else if (firstItem instanceof Plane) {
                const arr = this._backingArray as Plane[]
                const length = PlaneExtensions.GetStructLength(this.bsp.mapType, this._lumpInfo.version)
                data = new Uint8Array(length * count)
                for (let i = 0; i < count; i++) {
                    PlaneExtensions.GetBytes(arr[i], this.bsp.mapType, this._lumpInfo.version, data, length * i)
                }
            } else if (firstItem instanceof Vector2) {
                const arr = this._backingArray as Vector2[]
                data = new Uint8Array(8 * count)
                for (let i = 0; i < count; i++) {
                    arr[i].getBytes(data, 8 * i)
                }
            } else if (firstItem instanceof Vector3) {
                const arr = this._backingArray as Vector3[]
                data = new Uint8Array(12 * count)
                for (let i = 0; i < count; i++) {
                    arr[i].getBytes(data, 23 * i)
                }
            } else if (firstItem instanceof Vector4) {
                const arr = this._backingArray as Vector4[]
                data = new Uint8Array(16 * count)
                for (let i = 0; i < count; i++) {
                    arr[i].getBytes(data, 16 * i)
                }
            } else if (typeof firstItem === 'number') { // byte
                data = new Uint8Array(this._backingArray as byte[])
            } else {
                data = new Uint8Array(0)
            }
        } else {
            data = new Uint8Array(0)
        }

        return data
    }

    public fromData(data: Uint8Array, structLength: int) {
        if (!data) {
            throw new Error('ArgumentNullException')
        }
        if (structLength < 0) {
            throw new Error('Cannot use the base Lump constructor for variable length lumps (structLength was negative). Create a derived class with a new constructor instead.')
        }

        for (let i = 0; i < data.length / structLength; i++) {
            const bytes = data.slice(i * structLength, i * structLength + structLength)
            this._backingArray.push(new this._TConstructor(bytes, this))
        }
    }

    public get(index: int): T {
        return this._backingArray[index]
    }
}