import {Color4, Vector2, Vector3} from '@babylonjs/core'

export class Vertex {
    public position: Vector3
    public normal: Vector3
    public color: Color4

    // These are texture coords, or UVs
    public texcoord: Vector2
    public lmcoord: Vector2

    constructor(position: Vector3, texX: number, texY: number, lmX: number, lmY: number, normal: Vector3, color: Color4) {
        this.position = position
        this.normal = normal

        // Color data doesn't get used
        this.color = color

        // Invert the texture coords, to account for
        // the difference in the way Unity and Quake3
        // handle them.
        this.texcoord = new Vector2(texX, -texY)

        // Lightmaps aren't used for now, but store the
        // data for them anyway.  Inverted, same as above.
        this.lmcoord = new Vector2(lmX, lmY)

        // Do that swizzlin'.
        this.swizzle()
    }

    // This converts the verts from the format Q3 uses to the one Unity3D uses.
    // Look up the Q3 map/rendering specs if you want the details.
    // Quake3 also uses an odd scale where 0.03 units is about 1 meter, so scale it way down
    // while you're at it.
    private swizzle(): void {
        const tempz = this.position.z
        const tempy = this.position.y
        this.position.y = tempz
        this.position.z = -tempy
        this.position.x = -this.position.x

        const tempNormalZ = this.normal.z
        const tempNormalY = this.normal.y

        this.normal.y = tempNormalZ
        this.normal.z = -tempNormalY
        this.normal.x = -this.normal.x

        this.position.scale(0.03)
    }
}
