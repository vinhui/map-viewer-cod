import {Vector2, Vector3} from '../../Util/Vector'
import {float, int} from '../../../utils/number'

class Vertex {
    public height: int
    public unknown1: string
    public unknown2: string

    Vertex() {
        this.height = 0
        this.unknown1 = ''
        this.unknown2 = ''
    }
}

class Partition {
    public unknown1: int
    public unknown2: int
    public shader: string
    public textureShift: int[]
    public rotation: float
    public unknown3: int
    public textureScale: float[]
    public unknown4: int
    public flags: int
    public unknown5: int
    public properties: string

    public Partition() {
        this.unknown1 = 0
        this.unknown2 = 0
        this.shader = ''
        this.textureShift = new Array(2)
        this.rotation = 0
        this.unknown3 = 0
        this.textureScale = [1, 1]
        this.unknown4 = 0
        this.flags = 0
        this.unknown5 = 0
        this.properties = ''
    }
}

export class MAPTerrainMoHAA {

    public size: Vector2
    public flags: int
    public origin: Vector3
    public partitions: Partition[]
    public vertices: Vertex[]

    constructor(lines?: string[]) {
        if (!lines) {
            this.partitions = new Array(4)
            this.vertices = new Array(81)
            return
        }

        // TODO: Constructor to parse text
    }
}