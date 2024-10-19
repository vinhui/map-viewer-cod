export class EntityLump {
    public readonly entityString: string

    constructor(lump: string) {
        this.entityString = lump
    }

    public toString(): string {
        return this.entityString
    }
}