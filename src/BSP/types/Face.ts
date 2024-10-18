import {Vector3} from '@babylonjs/core'

export class Face {
    // The fields in this class are kind of obtuse.  I recommend looking up the Q3 .bsp map spec for full understanding.

    public texture: number
    public effect: number
    public type: number
    public vertex: number
    public n_vertexes: number
    public meshvert: number
    public n_meshverts: number
    public lm_index: number
    public lm_start: number[]
    public lm_size: number[]
    public lm_origin: Vector3
    public lm_vecs: Vector3[]
    public normal: Vector3
    public size: number[]

    constructor(texture: number, effect: number, type: number, vertex: number, n_vertexes: number, meshvert: number, n_meshverts: number,
                lm_index: number, lm_start: number[], lm_size: number[], lm_origin: Vector3, lm_vecs: Vector3[], normal: Vector3,
                size: number[]) {
        this.texture = texture
        this.effect = effect
        this.type = type
        this.vertex = vertex
        this.n_vertexes = n_vertexes
        this.meshvert = meshvert
        this.n_meshverts = n_meshverts
        this.lm_index = lm_index
        this.lm_start = lm_start
        this.lm_size = lm_size
        this.lm_origin = lm_origin
        this.lm_vecs = lm_vecs
        this.normal = normal
        this.size = size
    }
}