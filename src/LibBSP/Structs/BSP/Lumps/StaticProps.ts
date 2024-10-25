import {Lump} from '../../Common/Lumps/Lump'
import {BSP, LumpInfo, MapType} from '../BSP'
import {StringExtensions} from '../../../Extensions/StringExtensions'
import {short} from '../../../../utils/number'

export class StaticProps extends Lump<StaticProp> {
    public static readonly ModelNameLength = 128

    public modelDictionary: string[] = []
    public leafIndices: short[]

    constructor(items: StaticProps[], bsp: BSP, lumpInfo: LumpInfo) {
        super(items, bsp, lumpInfo)
    }

    public get length(): int {
        return 12
            + this.modelDictionary.length * StaticProps.ModelNameLength
            + this.leafIndices.length * 2
            + this._backingArray.length * this._backingArray[0].data.length
    }

    public static CreateFromProps(items: StaticProps[], dictionary: string[], bsp?: BSP, lumpInfo: LumpInfo = new LumpInfo()): StaticProps {
        const c = new StaticProps(items, bsp, lumpInfo)
        c.modelDictionary = dictionary
        return c
    }

    public static CreateFromData(data: Uint8Array, structLength: int, bsp: BSP, lumpInfo: LumpInfo = new LumpInfo()): StaticProps {
        if (!data || !bsp) {
            throw new Error('ArgumentNullException')
        }

        const view = new DataView(data.buffer)
        const c = new StaticProps(null, bsp, lumpInfo)

        if (data.length > 0) {
            let offset = 0

            const dictSize = view.getInt32(0)
            offset += 4
            for (let i = 0; i < dictSize; i++) {
                c.modelDictionary.push(StringExtensions.ToNullTerminatedString(data, offset, this.ModelNameLength))
                offset += this.ModelNameLength
            }

            const leafIndiciesCount = view.getInt32(offset)
            offset += 4
            for (let i = 0; i < leafIndiciesCount; i++) {
                c.leafIndices.push(view.getInt16(offset))
                offset += 2
            }
            if (bsp.mapType === MapType.Vindictus && lumpInfo.version >= 6) {
                const numPropsScales = view.getInt32(offset)
                offset += 4 + numPropsScales * 16
            }
            const numProps = view.getInt32(offset)
            if (lumpInfo.version === 12) {
                offset += 12
            } else {
                offset += 4
            }

            if (numProps > 0) {
                structLength = (data.length - offset) / numProps
                for (let i = 0; i < numProps; i++) {
                    const bytes = data.slice(offset, offset + structLength)
                    c._backingArray.push(new StaticProp(bytes, this))
                    offset += structLength
                }
            }
        } else {
            c.modelDictionary = []
        }
        return c
    }

    public getBytes(lumpOffset = 0): Uint8Array {
        if (this._backingArray.length === 0) {
            return new Uint8Array(12)
        }

        let length = this.length
        const bytes = new Uint8Array(length)
        const view = new DataView(bytes.buffer)
        let offset = 0
        view.setInt32(offset, this.modelDictionary.length)
        offset += 4

        for (let i = 0; i < this.modelDictionary.length; i++) {
            let name = this.modelDictionary[i]
            if (name.length > StaticProps.ModelNameLength) {
                name = name.substring(0, StaticProps.ModelNameLength)
            }
            bytes.set(new TextEncoder().encode(name), offset)
            offset += StaticProps.ModelNameLength
        }

        view.setInt32(offset, this.leafIndices.length)
        offset += 4

        for (let i = 0; i < this.leafIndices.length; i++) {
            view.setInt16(offset, this.leafIndices[i])
            offset += 2
        }

        view.setInt32(offset, this._backingArray.length)
        offset += 4

        bytes.set(await super.getBytes(), offset)

        return bytes
    }
}