import {Vector3} from './Vector'
import {int} from '../../utils/number'

export class Plane {
    public d: int
    public normal: Vector3


    constructor(normal: Vector3, d: int) {
        this.normal = normal
        this.d = d
    }

    public static CreateFromVertices(p1: Vector3, p2: Vector3, p3: Vector3): Plane {
        const edge1 = p2.sub(p1)
        const edge2 = p3.sub(p1)

        const normal = edge1.cross(edge2)
        normal.normalize()
        const d = -(normal.x * p1.x + normal.y * p1.y + normal.z * p1.z)

        return new Plane(normal, d)
    }
}