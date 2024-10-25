import {Vector3, Vector4} from '../../Utils/Vector'
import {float, int, parseFloatUS} from '../../../utils/number'
import {generate2dArray} from '../../../utils/array'

export class MAPTerrainEF2 {
    public side: int
    public texture: string
    public textureShiftS: float
    public textureShiftT: float
    public texRot: float
    public texScaleX: float
    public texScaleY: float
    public flags: int
    public sideLength: float
    public start: Vector3
    public IF: Vector4
    public LF: Vector4
    public heightMap: float[][]
    public alphaMap: float[][]

    constructor(lines?: string[]) {
        if (!lines) {
            return
        }

        this.texture = lines[2]

        switch (lines[0]) {
            case 'terrainDef': {
                for (let i = 2; i < lines.length; ++i) {
                    let line = lines[i].split(' ').filter(x => x)
                    switch (line[0]) {
                        case 'TEX(': {
                            this.texture = line[1]
                            this.textureShiftS = parseFloatUS(line[2])
                            this.textureShiftT = parseFloatUS(line[3])
                            this.texRot = parseFloatUS(line[4])
                            this.texScaleX = parseFloatUS(line[5])
                            this.texScaleY = parseFloatUS(line[6])
                            this.flags = parseInt(line[8], 10)
                            break
                        }
                        case 'TD(': {
                            this.sideLength = parseInt(line[1], 10)
                            this.start = new Vector3(parseFloatUS(line[2]), parseFloatUS(line[3]), parseFloatUS(line[4]))
                            break
                        }
                        case 'IF(': {
                            this.IF = new Vector4(parseFloatUS(line[1]), parseFloatUS(line[2]), parseFloatUS(line[3]), parseFloatUS(line[4]))
                            break
                        }
                        case 'LF(': {
                            this.LF = new Vector4(parseFloatUS(line[1]), parseFloatUS(line[2]), parseFloatUS(line[3]), parseFloatUS(line[4]))
                            break
                        }
                        case 'V(': {
                            ++i
                            line = lines[i].split(' ').filter(x => x)
                            if (this.side == 0) {
                                this.side = line.length
                            }
                            this.heightMap = generate2dArray(this.side, this.side, 0)
                            for (let j = 0; j < this.side; ++j) {
                                for (let k = 0; k < this.side; ++k) {
                                    this.heightMap[j][k] = parseFloatUS(line[k])
                                }
                                ++i
                                line = lines[i].split(' ').filter(x => x)
                            }
                            break
                        }
                        case 'A(': {
                            ++i
                            line = lines[i].split(' ').filter(x => x)
                            if (this.side == 0) {
                                this.side = line.length
                            }
                            this.alphaMap = generate2dArray(this.side, this.side, 0)
                            for (let j = 0; j < this.side; ++j) {
                                for (let k = 0; k < this.side; ++k) {
                                    this.alphaMap[j][k] = parseFloatUS(line[k])
                                }
                                ++i
                                line = lines[i].split(' ').filter(x => x)
                            }
                            break
                        }
                    }
                }
                break
            }
            default: {
                throw new Error(`Unknown terrain type ${lines[0]}!`)
            }
        }
    }
}