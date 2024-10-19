export class BSPTexture {
    public name: string
    public flags: number
    public contents: number

    constructor(rawName: string, flags: number, contents: number) {
        // The string is read as 64 characters, which includes a bunch of null bytes. We strip them to avoid oddness when printing and using the texture names.
        this.name = rawName.replace(/\0/g, '')
        this.flags = flags
        this.contents = contents

        // Remove some common shader modifiers to get normal
        // textures instead. This is kind of a hack, and could
        // bit you if a texture just happens to have any of these
        // in its name but isn't actually a shader texture.
        this.name = this.name.replace(/_hell/g, '')
        this.name = this.name.replace(/_trans/g, '')
        this.name = this.name.replace(/flat_400/g, '')
        this.name = this.name.replace(/_750/g, '')
    }
}