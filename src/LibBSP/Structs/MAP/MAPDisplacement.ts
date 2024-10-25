import {Vector3} from '../../Util/Vector'
import {StringExtensions} from '../../Extensions/StringExtensions'
import {float, int, parseFloatUS} from '../../../utils/number'
import {generate2dArray} from '../../../utils/array'

export class MAPDisplacement {
    public power: int
    public start: Vector3
    public normals: Vector3[][]
    public distances: float[][]
    public alphas: float[][]

    constructor(lines?: string[]) {
        if (!lines) {
            return
        }

        const normalsTokens: Map<int, string[]> = new Map()
        const distancesTokens: Map<int, string[]> = new Map()
        const alphasTokens: Map<int, string[]> = new Map()
        let braceCount = 0
        let inNormals = false
        let inDistances = false
        let inAlphas = false
        for (let line of lines) {
            if (line == '{') {
                ++braceCount
                continue
            } else if (line == '}') {
                --braceCount
                if (braceCount == 1) {
                    inNormals = false
                    inDistances = false
                    inAlphas = false
                }
                continue
            } else if (line == 'normals') {
                inNormals = true
                continue
            } else if (line == 'distances') {
                inDistances = true
                continue
            } else if (line == 'alphas') {
                inAlphas = true
                continue
            }

            if (braceCount == 1) {
                let tokens = StringExtensions.SplitUnlessInContainer(line, ' ', '\"', true)
                switch (tokens[0]) {
                    case 'power': {
                        this.power = parseInt(tokens[1], 10)
                        const side = Math.trunc(Math.pow(2, this.power) + 1)
                        this.normals = generate2dArray(side, side, Vector3)
                        this.distances = generate2dArray(side, side, 0)
                        this.alphas = generate2dArray(side, side, 0)
                        break
                    }
                    case 'startposition': {
                        const point = tokens[1].substring(1, tokens[1].length - 2).split(' ').filter(x => x)
                        this.start = new Vector3(parseFloatUS(point[0]), parseFloatUS(point[1]), parseFloatUS(point[2]))
                        break
                    }
                }
            } else if (braceCount > 1) {
                if (inNormals) {
                    const tokens = StringExtensions.SplitUnlessInContainer(line, ' ', '\"', true)
                    const row = parseInt(tokens[0].substring(3), 10)
                    normalsTokens[row] = tokens[1].split(' ').filter(x => x)
                } else if (inDistances) {
                    const tokens = StringExtensions.SplitUnlessInContainer(line, ' ', '\"', true)
                    const row = parseInt(tokens[0].substring(3), 10)
                    distancesTokens[row] = tokens[1].split(' ').filter(x => x)
                } else if (inAlphas) {
                    const tokens = StringExtensions.SplitUnlessInContainer(line, ' ', '\"', true)
                    const row = parseInt(tokens[0].substring(3), 10)
                    alphasTokens[row] = tokens[1].split(' ').filter(x => x)
                }
            }
        }

        if (this.power == 0) {
            throw new Error('Bad data given to MAPDisplacement, no power specified!')
        }

        if (isNaN(this.start.x)) {
            throw new Error('Bad data given to MAPDisplacement, no starting point specified!')
        }


        for (let i of normalsTokens.keys()) {
            for (let j = 0; j < normalsTokens.get(i).length / 3; j++) {
                this.normals[i][j].set(parseFloatUS(normalsTokens[i][j * 3]), parseFloatUS(normalsTokens[i][(j * 3) + 1]), parseFloatUS(normalsTokens[i][(j * 3) + 2]))
                this.distances[i][j] = parseFloatUS(distancesTokens[i][j])
                this.alphas[i][j] = parseFloatUS(alphasTokens[i][j])
            }
        }
    }
}