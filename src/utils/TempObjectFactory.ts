import {Vector2, Vector3} from '@babylonjs/core'

export type Temp<T> = {
    [P in keyof T]: T[P];
} & {
    releaseTmp: () => void
    [Symbol.dispose]: () => void
    _isTmpInUse: boolean
}

export class TempObjectFactory<T> {
    readonly maxCacheSize: number = 500
    private readonly cache: Temp<T>[] = []
    private readonly typeConstructor: new () => T

    /**
     * @param type
     * @param maxCacheSize The max size that the cache can grow to
     * @param preAllocate Pre-allocate the entire cache, it will create {@see maxCacheSize} items
     */
    constructor(type: new () => T, maxCacheSize: number = 500, preAllocate: boolean = false) {
        this.typeConstructor = type
        this.maxCacheSize = maxCacheSize

        if (preAllocate) {
            for (let i = 0; i < maxCacheSize; i++) {
                this.cache[i] = this.getNewItem()
            }
        }
    }

    public get cacheSize(): number {
        return this.cache.length
    }

    public get freeItemsCount(): number {
        let i = 0
        for (let elem of this.cache) {
            if (!elem._isTmpInUse) {
                i++
            }
        }
        return i
    }

    public get inUseItemsCount(): number {
        let i = 0
        for (let elem of this.cache) {
            if (elem._isTmpInUse) {
                i++
            }
        }
        return i
    }

    /**
     * @return The returned object may have pre-existing values. Be sure to also release the object again!
     */
    public get(): Temp<T> {
        const len = this.cache.length
        for (let i = 0; i < len; i++) {
            if (this.cache[i]._isTmpInUse) continue
            this.cache[i]._isTmpInUse = true
            return this.cache[i]
        }

        if (this.cacheSize >= this.maxCacheSize)
            throw new Error(`Temp object factory (${this.typeConstructor.name}) is exceeding its cache size (${this.cacheSize}). You're probably leaking objects`)

        const item = this.getNewItem()
        item._isTmpInUse = true
        this.cache.push(item)
        return item
    }

    public getCopy(other: T): Temp<T> {
        const o = this.get()
        if ('copyFrom' in o && typeof o.copyFrom === 'function') {
            o.copyFrom(other)
        } else {
            throw new Error(`Type does not have a copyFrom method`)
        }
        return o
    }

    public release(item: Temp<T>) {
        item._isTmpInUse = false
    }

    private getNewItem(): Temp<T> {
        const item = new this.typeConstructor() as Temp<T>
        item.releaseTmp = () => this.release(item)
        item[Symbol.dispose] = () => this.release(item)
        item._isTmpInUse = false
        return item
    }
}

export const TempVec3Factory = new TempObjectFactory(Vector3)
export const TempVec2Factory = new TempObjectFactory(Vector2)