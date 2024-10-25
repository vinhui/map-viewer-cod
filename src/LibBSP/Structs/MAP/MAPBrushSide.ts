import {Vector2, Vector3} from '../../Utils/Vector'
import {Plane} from '../../Utils/Plane'
import {TextureInfo} from '../Common/TextureInfo'
import {StringExtensions} from '../../Extensions/StringExtensions'
import {float, int, parseFloatUS} from '../../../utils/number'
import {PlaneExtensions} from '../../Extensions/PlaneExtensions'
import {MAPDisplacement} from './MAPDisplacement'
import {LumpObjDataCtor} from '../Common/ILumpObject'

export class MAPBrushSide {
    public vertices: Vector3[]
    public plane: Plane
    public texture: string
    public textureInfo: TextureInfo
    public material: string
    public lgtScale: float
    public lgtRot: float
    public smoothingGroups: int
    public id: int
    public displacement: MAPDisplacement

    constructor(lines?: string[]) {
        if (!lines) {
            return
        }

        // If lines.Length is 1, then this line contains all data for a brush side
        if (lines.length == 1) {
            let tokens = StringExtensions.SplitUnlessInContainer(lines[0], ' ', '\"', true)

            // If this succeeds, assume brushDef3
            const dist = parseFloat(tokens[4])
            if (!isNaN(dist)) {
                this.plane = new Plane(new Vector3(parseFloatUS(tokens[1]), parseFloatUS(tokens[2]), parseFloatUS(tokens[3])), dist)
                this.textureInfo = TextureInfo.CreateFromProps(new Vector3(parseFloatUS(tokens[8]), parseFloatUS(tokens[9]), parseFloatUS(tokens[10])),
                    new Vector3(parseFloatUS(tokens[13]), parseFloatUS(tokens[14]), parseFloatUS(tokens[15])),
                    new Vector2(0, 0),
                    new Vector2(1, 1),
                    0, 0, 0)
                this.texture = tokens[18]
            } else {
                const v1 = new Vector3(parseFloatUS(tokens[1]), parseFloatUS(tokens[2]), parseFloatUS(tokens[3]))
                const v2 = new Vector3(parseFloatUS(tokens[6]), parseFloatUS(tokens[7]), parseFloatUS(tokens[8]))
                const v3 = new Vector3(parseFloatUS(tokens[11]), parseFloatUS(tokens[12]), parseFloatUS(tokens[13]))
                this.vertices = [v1, v2, v3]
                this.plane = PlaneExtensions.CreateFromVertices(v1, v2, v3)
                this.texture = tokens[15]
                // GearCraft
                if (tokens[16] == '[') {
                    this.textureInfo = TextureInfo.CreateFromProps(new Vector3(parseFloatUS(tokens[17]), parseFloatUS(tokens[18]), parseFloatUS(tokens[19])),
                        new Vector3(parseFloatUS(tokens[23]), parseFloatUS(tokens[24]), parseFloatUS(tokens[25])),
                        new Vector2(parseFloatUS(tokens[20]), parseFloatUS(tokens[26])),
                        new Vector2(parseFloatUS(tokens[29]), parseFloatUS(tokens[30])),
                        parseInt(tokens[31], 10), 0, parseFloatUS(tokens[28]))
                    this.material = tokens[32]
                } else {
                    //<x_shift> <y_shift> <rotation> <x_scale> <y_scale> <content_flags> <surface_flags> <value>
                    let axes = TextureInfo.TextureAxisFromPlane(this.plane)
                    this.textureInfo = TextureInfo.CreateFromProps(axes[0],
                        axes[1],
                        new Vector2(parseFloatUS(tokens[16]), parseFloatUS(tokens[17])),
                        new Vector2(parseFloatUS(tokens[19]), parseFloatUS(tokens[20])),
                        parseInt(tokens[22], 10), 0, parseFloatUS(tokens[18]))
                }
            }
        } else {
            let inDispInfo = false
            let braceCount = 0
            this.textureInfo = new TextureInfo(new LumpObjDataCtor(null, null))
            let child = []
            for (let line of lines) {
                if (line == '{') {
                    ++braceCount
                } else if (line == '}') {
                    --braceCount
                    if (braceCount == 1) {
                        child.push(line)
                        this.displacement = new MAPDisplacement(child)
                        child = []
                        inDispInfo = false
                    }
                } else if (line == 'dispinfo') {
                    inDispInfo = true
                    continue
                }

                if (braceCount == 1) {
                    let tokens = StringExtensions.SplitUnlessInContainer(line, ' ', '\"', true)
                    switch (tokens[0]) {
                        case 'material': {
                            this.texture = tokens[1]
                            break
                        }
                        case 'plane': {
                            const points = StringExtensions.SplitUnlessBetweenDelimiters(tokens[1], ' ', '(', ')', true)
                            let components = points[0].split(' ').filter(x => x)
                            let v1 = new Vector3(parseFloatUS(components[0]), parseFloatUS(components[1]), parseFloatUS(components[2]))
                            components = points[1].split(' ').filter(x => x)
                            let v2 = new Vector3(parseFloatUS(components[0]), parseFloatUS(components[1]), parseFloatUS(components[2]))
                            components = points[2].split(' ').filter(x => x)
                            let v3 = new Vector3(parseFloatUS(components[0]), parseFloatUS(components[1]), parseFloatUS(components[2]))
                            this.plane = PlaneExtensions.CreateFromVertices(v1, v2, v3)
                            break
                        }
                        case 'uaxis': {
                            let split = StringExtensions.SplitUnlessBetweenDelimiters(tokens[1], ' ', '[', ']', true)
                            this.textureInfo.scale = new Vector2(parseFloatUS(split[1]), this.textureInfo.scale.y)
                            split = split[0].split(' ').filter(x => x)
                            this.textureInfo.uAxis = new Vector3(parseFloatUS(split[0]), parseFloatUS(split[1]), parseFloatUS(split[2]))
                            this.textureInfo.translation = new Vector2(parseFloatUS(split[3]), this.textureInfo.translation.y)
                            break
                        }
                        case 'vaxis': {
                            let split = StringExtensions.SplitUnlessBetweenDelimiters(tokens[1], ' ', '[', ']', true)
                            this.textureInfo.scale = new Vector2(this.textureInfo.scale.x, parseFloatUS(split[1]))
                            split = split[0].split(' ').filter(x => x)
                            this.textureInfo.vAxis = new Vector3(parseFloatUS(split[0]), parseFloatUS(split[1]), parseFloatUS(split[2]))
                            this.textureInfo.translation = new Vector2(this.textureInfo.translation.x, parseFloatUS(split[3]))
                            break
                        }
                        case 'rotation': {
                            this.textureInfo.rotation = parseFloatUS(tokens[1])
                            break
                        }
                    }
                } else if (braceCount > 1) {
                    if (inDispInfo) {
                        child.push(line)
                    }
                }
            }
        }
    }
}