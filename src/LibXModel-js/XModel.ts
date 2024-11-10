import {XModelVersion} from './XModelVersion'
import {GameVersion} from './GameVersion'

export interface XModelLod {
    name: string
    distance: number
    materials: string[]
}

export interface XModel {
    name: string
    version: XModelVersion
    lods: XModelLod[]
    collisionLodIndex: number
}

export class XModelLoader {
    private buffer: DataView
    private offset = 0

    constructor(data: Uint8Array) {
        this.buffer = new DataView(data.buffer)
    }

    public async load(name: string, selectedVersion: GameVersion): Promise<XModel> {
        const versionNumber = this.readUInt16()

        const version = this.validateVersion(versionNumber)
        if (!version) {
            throw new Error(`Invalid XModel version ${versionNumber}`)
        }

        const xmodel: XModel = {name, version, lods: [], collisionLodIndex: -1}

        switch (selectedVersion) {
            case GameVersion.CoD:
                await this.loadV14(xmodel)
                break
            case GameVersion.CoD2:
                await this.loadV20(xmodel)
                break
            case GameVersion.CoD4:
            case GameVersion.CoD5:
                await this.loadV25(xmodel, selectedVersion)
                break
            case GameVersion.CoDBO1:
                await this.loadV62(xmodel)
                break
            default:
                throw new Error(`Unsupported game version ${selectedVersion}`)
        }

        return xmodel
    }

    private readUInt8(): number {
        const value = this.buffer.getUint8(this.offset)
        this.offset += 1
        return value
    }

    private readUInt16(): number {
        const value = this.buffer.getUint16(this.offset, true)
        this.offset += 2
        return value
    }

    private readUInt32(): number {
        const value = this.buffer.getUint32(this.offset, true)
        this.offset += 4
        return value
    }

    private readFloat32(): number {
        const value = this.buffer.getFloat32(this.offset, true)
        this.offset += 4
        return value
    }

    private readString(): string {
        let result = ''
        let char
        while ((char = this.buffer.getUint8(this.offset++)) !== 0) {
            result += String.fromCharCode(char)
        }
        return result
    }

    private skip(bytes: number) {
        this.offset += bytes
    }

    private validateVersion(versionNumber: number): XModelVersion | null {
        switch (versionNumber) {
            case XModelVersion.V14:
                return XModelVersion.V14
            case XModelVersion.V20:
                return XModelVersion.V20
            case XModelVersion.V25:
                return XModelVersion.V25
            case XModelVersion.V62:
                return XModelVersion.V62
            default:
                return null
        }
    }

    private async loadV14(xmodel: XModel): Promise<void> {
        this.skip(24)

        for (let i = 0; i < 3; i++) {
            const distance = this.readFloat32()
            const name = this.readString()

            if (name) {
                xmodel.lods.push({name, distance, materials: []})
            }
        }

        const collisionLodIndex = this.readUInt16()
        if (collisionLodIndex < xmodel.lods.length) {
            xmodel.collisionLodIndex = collisionLodIndex
        }
        this.skip(2)

        const paddingCount = this.readUInt32()
        for (let i = 0; i < paddingCount; i++) {
            const subPaddingCount = this.readUInt32()
            this.skip((subPaddingCount * 48) + 36)
        }

        for (const lod of xmodel.lods) {
            const textureCount = this.readUInt16()
            for (let j = 0; j < textureCount; j++) {
                lod.materials.push(this.readString())
            }
        }
    }

    private async loadV20(xmodel: XModel): Promise<void> {
        this.skip(25)

        for (let i = 0; i < 4; i++) {
            const distance = this.readFloat32()
            const name = this.readString()

            if (name) {
                xmodel.lods.push({name, distance, materials: []})
            }
        }

        const collisionLodIndex = this.readUInt16()
        if (collisionLodIndex < xmodel.lods.length) {
            xmodel.collisionLodIndex = collisionLodIndex
        }
        this.skip(2)

        const paddingCount = this.readUInt32()
        for (let i = 0; i < paddingCount; i++) {
            const subPaddingCount = this.readUInt32()
            this.skip((subPaddingCount * 48) + 36)
        }

        for (const lod of xmodel.lods) {
            const materialCount = this.readUInt16()
            for (let j = 0; j < materialCount; j++) {
                lod.materials.push(this.readString())
            }
        }
    }

    private async loadV25(xmodel: XModel, version: GameVersion): Promise<void> {
        this.skip(25)
        this.readString()

        if (version === GameVersion.CoD5) {
            this.readString()
        }

        for (let i = 0; i < 4; i++) {
            const distance = this.readFloat32()
            const name = this.readString()

            if (name) {
                xmodel.lods.push({name, distance, materials: []})
            }
        }

        const collisionLodIndex = this.readUInt16()
        if (collisionLodIndex < xmodel.lods.length) {
            xmodel.collisionLodIndex = collisionLodIndex
        }
        this.skip(2)

        const paddingCount = this.readUInt32()
        for (let i = 0; i < paddingCount; i++) {
            const subPaddingCount = this.readUInt32()
            this.skip((subPaddingCount * 48) + 36)
        }

        for (const lod of xmodel.lods) {
            const materialCount = this.readUInt16()
            for (let j = 0; j < materialCount; j++) {
                lod.materials.push(this.readString())
            }
        }
    }

    private async loadV62(xmodel: XModel): Promise<void> {
        this.skip(28)
        this.readString()
        this.readString()
        this.skip(5)

        for (let i = 0; i < 4; i++) {
            const distance = this.readFloat32()
            const name = this.readString()

            if (name) {
                xmodel.lods.push({name, distance, materials: []})
            }
        }

        const collisionLodIndex = this.readUInt16()
        if (collisionLodIndex < xmodel.lods.length) {
            xmodel.collisionLodIndex = collisionLodIndex
        }
        this.skip(2)

        const paddingCount = this.readUInt32()
        for (let i = 0; i < paddingCount; i++) {
            const subPaddingCount = this.readUInt32()
            this.skip((subPaddingCount * 48) + 36)
        }

        for (const lod of xmodel.lods) {
            const materialCount = this.readUInt16()
            for (let j = 0; j < materialCount; j++) {
                lod.materials.push(this.readString())
            }
        }
    }
}
