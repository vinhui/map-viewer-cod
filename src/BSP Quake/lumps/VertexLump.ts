import {Vector3} from '@babylonjs/core'
import {Vertex} from '../types/Vertex' // Using Babylon.js for Vector3 type

export class VertexLump {
    public verts: Vertex[] = []
    public meshVerts: number[] = []

    public toString(): string {
        let blob = ''
        this.verts.forEach((vertex, index) => {
            blob += `Vertex ${index} Pos: ${vertex.position} Normal: ${vertex.normal}\r\n`
        })
        return blob
    }
}