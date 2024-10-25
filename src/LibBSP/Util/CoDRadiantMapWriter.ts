import {Entities} from '../Structs/Common/Lumps/Entities'
import {Entity} from '../Structs/Common/Entity'
import {int, trimFormatNumber} from '../../utils/number'
import {MAPBrush} from '../Structs/MAP/MAPBrush'
import {MAPBrushSide} from '../Structs/MAP/MAPBrushSide'
import {MAPPatch} from '../Structs/MAP/MAPPatch'

export class CoDRadiantMapWriter {
    private _entities: Entities

    constructor(from: Entities) {
        this._entities = from
    }

    public parseMap(): string {
        let result = ''
        for (let i = 0; i < this._entities.count; i++) {
            result += this.parseEntity(this._entities.get(i), i)
        }
        return result
    }

    private parseEntity(entity: Entity, index: int): string {
        let sb = ''
        if (index > 0) {
            sb += `// entity ${{index}}\r\n`
        }
        sb += '{\r\n'
        for (let [key, val] of entity.map.entries()) {
            sb += `"${key}" "${val}"\r\n`
        }
        for (let i = 0; i < entity.brushes.length; i++) {
            sb += this.parseBrush(entity.brushes[i], i)
        }
        sb += '}\r\n'
        return sb
    }

    private parseBrush(brush: MAPBrush, index: int): string {
        if (brush.mohTerrain || brush.ef2Terrain) {
            return ''
        }
        if (brush.sides.length < 4 && !brush.patch) {
            return ''
        }

        let sb = `// brush ${index}\r\n`
        if (brush.patch) {
            sb += this.parsePatch(brush.patch)
        } else {
            sb += '{\r\n'
            for (let brushSide of brush.sides) {
                sb += this.parseBrushSide(brushSide)
            }
            sb += '}\r\n'
        }
    }

    private parseBrushSide(brushside: MAPBrushSide): string {
        let sb = `( ${trimFormatNumber(brushside.vertices[0].x, 10)} ${trimFormatNumber(brushside.vertices[0].y, 10)} ${trimFormatNumber(brushside.vertices[0].z, 10)} )`
        sb += ` ( ${trimFormatNumber(brushside.vertices[1].x, 10)} ${trimFormatNumber(brushside.vertices[1].y, 10)} ${trimFormatNumber(brushside.vertices[1].z, 10)} )`
        sb += ` ( ${trimFormatNumber(brushside.vertices[2].x, 10)} ${trimFormatNumber(brushside.vertices[2].y, 10)} ${trimFormatNumber(brushside.vertices[2].z, 10)} ) `
        sb += brushside.texture
        sb += ` ${trimFormatNumber(brushside.textureInfo.translation.x, 10)} ${trimFormatNumber(brushside.textureInfo.translation.y, 10)}`
        sb += ` ${trimFormatNumber(brushside.textureInfo.rotation, 10)}`
        sb += ` ${trimFormatNumber(brushside.textureInfo.scale.x, 10)} ${trimFormatNumber(brushside.textureInfo.scale.y, 10)}`
        sb += ` ${brushside.textureInfo.flags} 0 0 0\r`
        return sb
    }

    private parsePatch(patch: MAPPatch): string {
        let sb = ''
        sb += ' {\r\n  patchDef5\r\n  {\r\n   '
        sb += patch.texture
        sb += '\r\n   ( '
        sb += Math.round(patch.dims.x)
        sb += ' '
        sb += Math.round(patch.dims.y)
        sb += ' 0 0 0 0 8 )\r\n(\r\n'
        for (let i = 0; i < patch.dims.x; ++i) {
            sb += '( '
            for (let j = 0; j < patch.dims.y; ++j) {
                const vertex = patch.points[(Math.round(patch.dims.x) * j) + i]
                sb += '( '
                sb += trimFormatNumber(vertex.x, 5)
                sb += ' '
                sb += trimFormatNumber(vertex.y, 5)
                sb += ' '
                sb += trimFormatNumber(vertex.z, 5)
                sb += ' 0 0 255 255 255 255 0 ) '
            }
            sb += ')\r\n'
        }
        sb += ')\r\n  }\r\n }\r\n'
        return sb
    }
}