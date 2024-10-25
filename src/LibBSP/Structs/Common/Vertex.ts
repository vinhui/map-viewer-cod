import {Vector2, Vector3, Vector4} from '../../Util/Vector'
import {Color} from '../../Util/Color'

export class Vertex {
    public position: Vector3
    public normal: Vector3
    public color: Color
    public uv0: Vector2
    public uv1: Vector2
    public uv2: Vector2
    public uv3: Vector2
    public tangent: Vector4

    public static get simpleVert(): Vertex {
        const v = new Vertex()
        v.position = new Vector3()
        v.normal = new Vector3(0, 0, -1)
        v.color = new Color(255, 255, 255, 255)
        v.uv0 = new Vector2()
        v.uv1 = new Vector2()
        v.uv2 = new Vector2()
        v.uv3 = new Vector2()
        v.tangent = new Vector4(1, 0, 0, -1)
        return v
    }
}