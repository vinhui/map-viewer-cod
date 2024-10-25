import {Entities} from '../Structs/Common/Lumps/Entities'
import {Entity} from '../Structs/Common/Entity'
import {int, trimFormatNumber} from '../../utils/number'
import {MAPBrush} from '../Structs/MAP/MAPBrush'
import {MAPBrushSide} from '../Structs/MAP/MAPBrushSide'
import {MAPPatch} from '../Structs/MAP/MAPPatch'
import {MAPTerrainMoHAA} from '../Structs/MAP/MAPTerrainMoHAA'

function formatNumber(value: number, decimalPlaces: number, beforeDecimalPlaces: number = 4): string {
    let formatted = value.toFixed(decimalPlaces)

    const [whole, decimal] = formatted.split('.')
    if (whole.length > beforeDecimalPlaces) {
        formatted = whole.slice(-beforeDecimalPlaces) + (decimal ? '.' + decimal : '')
    }

    return formatted
}

export class MoHRadiantMapWriter {
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
        if (index !== 0) {
            sb += '// Entity '
            sb += index
            sb += '\r\n'
        }
        sb += '{\r\n'
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
        if (!brush.ef2Terrain) {
            return ''
        }
        if (brush.sides.length < 4 && brush.patch && brush.mohTerrain) {
            // Can't create a brush with less than 4 sides
            return ''
        }
        let sb = ''
        sb += '// Brush '
        sb += index.toString()
        sb += '\r\n'
        if (!brush.patch) {
            sb += this.parsePatch(brush.patch)
        } else if (!brush.mohTerrain) {
            sb += this.parseTerrain(brush.mohTerrain)
        } else {
            sb += '{\r\n'
            for (let brushSide of brush.sides) {
                sb += this.parseBrushSide(brushSide, brush.isDetail)
            }
            sb += '}\r\n'
        }
        return sb
    }

    private parseBrushSide(brushside: MAPBrushSide, isDetail: boolean): string {
        let sb = ''
        sb += '( '
        sb += trimFormatNumber(brushside.vertices[0].x, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[0].y, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[0].z, 6, 3)
        sb += ' ) ( '
        sb += trimFormatNumber(brushside.vertices[1].x, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[1].y, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[1].z, 6, 3)
        sb += ' ) ( '
        sb += trimFormatNumber(brushside.vertices[2].x, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[2].y, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[2].z, 6, 3)
        sb += ' ) '
        sb += brushside.texture
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.translation.x, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.translation.y, 6, 3)
        sb += ' '
        sb += formatNumber(brushside.textureInfo.rotation, 4, 2)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.scale.x, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.scale.y, 6, 3)
        sb += ' '
        sb += brushside.textureInfo.flags
        sb += ' 0 0'
        if (isDetail) {
            sb += ' +surfaceparm detail'
        }
        sb += '\r\n'
        return sb
    }

    private parsePatch(patch: MAPPatch): string {
        let sb = ''
        sb += ' {\r\n  patchDef2\r\n  {\r\n'
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
        sb += ')\r\n  }\r\n }\r\n'
        return sb
    }

    private parseTerrain(terrain: MAPTerrainMoHAA): string {
        let sb = ''
        sb += ' {\r\n  terrainDef\r\n  {\r\n   '
        sb += terrain.size.x
        sb += ' '
        sb += terrain.size.y
        sb += ' '
        sb += terrain.flags
        sb += '\r\n   '
        sb += formatNumber(terrain.origin.x, 4, 6)
        sb += ' '
        sb += formatNumber(terrain.origin.y, 4, 6)
        sb += ' '
        sb += formatNumber(terrain.origin.z, 4, 6)
        sb += '\r\n\t\t{\r\n'
        for (const partition of terrain.partitions) {
            sb += '\t\t\t'
            sb += partition.unknown1
            sb += ' '
            sb += partition.unknown2
            sb += ' ( '
            sb += partition.shader
            sb += ' '
            sb += partition.textureShift[0]
            sb += ' '
            sb += partition.textureShift[1]
            sb += ' '
            sb += formatNumber(partition.rotation, 4, 2)
            sb += ' '
            sb += partition.unknown3
            sb += ' '
            sb += partition.textureScale[0]
            sb += ' '
            sb += partition.textureScale[1]
            sb += ' '
            sb += partition.unknown4
            sb += ' '
            sb += partition.flags
            sb += ' '
            sb += partition.unknown5
            if (partition.properties?.length > 0) {
                sb += ' '
                sb += partition.properties
            }
            sb += ' )\r\n'
        }
        sb += '\t\t}\r\n\t\t{\r\n'
        for (let vertex of terrain.vertices) {
            sb += '\t\t\t'
            sb += formatNumber(vertex.height, 4, 6)
            sb += ' ( '
            if (vertex.unknown1?.length > 0) {
                sb += vertex.unknown1
                sb += ' '
            }
            sb += ') ( '
            if (vertex.unknown2?.length > 0) {
                sb += vertex.unknown2
                sb += ' '
            }
            sb += ')\r\n'
        }
        sb += '\t\t}\r\n  }\r\n }\r\n'
        return sb
    }


}