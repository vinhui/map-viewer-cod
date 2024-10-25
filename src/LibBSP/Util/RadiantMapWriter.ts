import {Entities} from '../Structs/Common/Lumps/Entities'
import {Entity} from '../Structs/Common/Entity'
import {int, trimFormatNumber} from '../../utils/number'
import {MAPBrush} from '../Structs/MAP/MAPBrush'
import {MAPBrushSide} from '../Structs/MAP/MAPBrushSide'
import {MAPPatch} from '../Structs/MAP/MAPPatch'
import {MAPTerrainEF2} from '../Structs/MAP/MAPTerrainEF2'

function formatNumber(value: number): string {
    let formatted = Math.round(value).toString(10)

    if (formatted.length > 4) {
        formatted = formatted.slice(-4)
    }

    return formatted
}

export class RadiantMapWriter {
    private _entities: Entities

    constructor(from: Entities) {
        this._entities = from
    }

    public parseMap(): string {
        let sb = ''
        for (let i = 0; i < this._entities.length; ++i) {
            sb += this.parseEntity(this._entities.get(i), i)
        }
        return sb
    }

    private parseEntity(entity: Entity, index: int): string {
        let sb = ''
        sb += '// entity '
        sb += index
        sb += '\r\n{\r\n'
        for (let [key, value] of entity.map.entries()) {
            sb += '"'
            sb += key
            sb += '" "'
            sb += value
            sb += '"\r\n'
        }
        for (let i = 0; i < entity.brushes.length; ++i) {
            sb += this.parseBrush(entity.brushes[i], i)
        }
        sb += '}\r\n'
        return sb
    }

    private parseBrush(brush: MAPBrush, index: int): string {
        // Unsupported features. Ignore these completely.
        if (!brush.mohTerrain) {
            return ''
        }
        if (brush.sides.length < 4 && brush.patch && brush.ef2Terrain) {
            // Can't create a brush with less than 4 sides
            return ''
        }
        let sb = ''
        sb += '// brush '
        sb += index.toString()
        sb += '\r\n{\r\n'
        if (!brush.patch) {
            sb += this.parsePatch(brush.patch)
        } else if (!brush.ef2Terrain) {
            sb += this.parseTerrain(brush.ef2Terrain)
        } else {
            for (let brushSide of brush.sides) {
                sb += this.parseBrushSide(brushSide)
            }
        }
        sb += '}\r\n'
        return sb
    }

    private parseBrushSide(brushside: MAPBrushSide): string {
        let sb = ''
        sb += '( '
        sb += trimFormatNumber(brushside.vertices[0].x, 10, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[0].y, 10, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[0].z, 10, 3)
        sb += ' ) ( '
        sb += trimFormatNumber(brushside.vertices[1].x, 10, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[1].y, 10, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[1].z, 10, 3)
        sb += ' ) ( '
        sb += trimFormatNumber(brushside.vertices[2].x, 10, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[2].y, 10, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[2].z, 10, 3)
        sb += ' ) '
        sb += brushside.texture
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.translation.x, 10, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.translation.y, 10, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.rotation, 10, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.scale.x, 10, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.scale.y, 10, 3)
        sb += ' '
        sb += brushside.textureInfo.flags
        sb += ' 0 0\r\n'
        return sb
    }

    private parsePatch(patch: MAPPatch): string {
        let sb = ''
        sb += 'patchDef2\r\n{\r\n'
        sb += patch.texture
        sb += '\r\n( '
        sb += Math.round(patch.dims.x)
        sb += ' '
        sb += Math.round(patch.dims.y)
        sb += ' 0 0 0 )\r\n(\r\n'
        for (let i = 0; i < patch.dims.x; ++i) {
            sb += '( '
            for (let j = 0; j < patch.dims.y; ++j) {
                const vertex = patch.points[(Math.round(patch.dims.x) * j) + i]
                sb += '( '
                sb += trimFormatNumber(vertex.x, 5, 3)
                sb += ' '
                sb += trimFormatNumber(vertex.y, 5, 3)
                sb += ' '
                sb += trimFormatNumber(vertex.z, 5, 3)
                sb += ' 0 0 ) '
            }
            sb += ')\r\n'
        }
        sb += ')\r\n}\r\n'
        return sb
    }

    private parseTerrain(terrain: MAPTerrainEF2): string {
        let sb = ''
        sb += '  terrainDef\r\n  {\r\n    TEX( '
        sb += terrain.texture
        sb += ' '
        sb += trimFormatNumber(terrain.textureShiftS, 10, 3)
        sb += ' '
        sb += trimFormatNumber(terrain.textureShiftT, 10, 3)
        sb += ' '
        sb += trimFormatNumber(terrain.texRot, 10, 3)
        sb += ' '
        sb += trimFormatNumber(terrain.texScaleX, 10, 3)
        sb += ' '
        sb += trimFormatNumber(terrain.texScaleY, 10, 3)
        sb += ' '
        sb += terrain.flags
        sb += ' 0 0 )\r\n    TD( '
        sb += formatNumber(terrain.sideLength)
        sb += ' '
        sb += trimFormatNumber(terrain.start.x, 10, 3)
        sb += ' '
        sb += trimFormatNumber(terrain.start.y, 10, 3)
        sb += ' '
        sb += trimFormatNumber(terrain.start.z, 10, 3)
        sb += ' )\r\n    IF( '
        sb += trimFormatNumber(terrain.IF.x, 10, 3)
        sb += ' '
        sb += trimFormatNumber(terrain.IF.y, 10, 3)
        sb += ' '
        sb += trimFormatNumber(terrain.IF.z, 10, 3)
        sb += ' '
        sb += trimFormatNumber(terrain.IF.w, 10, 3)
        sb += ' )\r\n    LF( '
        sb += trimFormatNumber(terrain.LF.x, 10, 3)
        sb += ' '
        sb += trimFormatNumber(terrain.LF.y, 10, 3)
        sb += ' '
        sb += trimFormatNumber(terrain.LF.z, 10, 3)
        sb += ' '
        sb += trimFormatNumber(terrain.LF.w, 10, 3)
        sb += ' )\r\n    V(\r\n'
        for (let i = 0; i < terrain.heightMap.length; ++i) {
            sb += '      '
            for (let j = 0; j < terrain.heightMap[i].length; ++j) {
                sb += trimFormatNumber(terrain.heightMap[i][j], 10, 3)
                sb += ' '
            }
            sb += '\r\n'
        }
        sb += '    )\r\n    A(\r\n'
        for (let i = 0; i < terrain.alphaMap.length; ++i) {
            sb += '      '
            for (let j = 0; j < terrain.alphaMap[i].length; ++j) {
                sb += trimFormatNumber(terrain.alphaMap[i][j], 10, 3)
                sb += ' '
            }
            sb += '\r\n'
        }
        sb += '    )\r\n  }\r\n'
        return sb
    }
}