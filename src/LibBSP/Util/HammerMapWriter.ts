import {Entities} from '../Structs/Common/Lumps/Entities'
import {Entity} from '../Structs/Common/Entity'
import {trimFormatNumber} from '../../utils/number'
import {MAPBrush} from '../Structs/MAP/MAPBrush'
import {MAPBrushSide} from '../Structs/MAP/MAPBrushSide'
import {MAPDisplacement} from '../Structs/MAP/MAPDisplacement'

export class HammerMapWriter {
    private _entities: Entities

    private _nextID = 0

    constructor(from: Entities) {
        this._entities = from
    }

    public parseMap(): string {
        let sb = ''
        for (let i = 0; i < this._entities.length; ++i) {
            ++this._nextID
            sb += this.parseEntity(this._entities.get(i))
        }
        return sb
    }

    private parseEntity(entity: Entity): string {
        let sb = ''
        if (entity.valueIs('classname', 'worldspawn')) {
            sb += 'world\r\n{\r\n'
        } else {
            sb += 'entity\r\n{\r\n'
        }
        for (let [key, value] of entity.map.entries()) {
            sb += '\t"'
            sb += key
            sb += '" "'
            sb += value
            sb += '"\r\n'
        }
        sb += '\t"id" "'
        sb += this._nextID
        sb += '"\r\n'
        if (entity.connections?.length > 0) {
            sb += '\tconnections\r\n\t{\r\n'
            for (let connection of entity.connections) {
                sb += '\t\t"'
                sb += connection.name
                sb += '" "'
                sb += connection.target
                sb += ','
                sb += connection.action
                sb += ','
                sb += connection.param
                sb += ','
                sb += trimFormatNumber(connection.delay, 6, 3)
                sb += ','
                sb += connection.fireOnce
                if (connection.unknown0 !== '' || connection.unknown1 !== '') {
                    sb += ','
                    sb += connection.unknown0
                    sb += ','
                    sb += connection.unknown1
                }
                sb += '"\r\n'
            }
            sb += '\t}\r\n'
        }
        for (let i = 0; i < entity.brushes.length; ++i) {
            ++this._nextID
            sb += this.parseBrush(entity.brushes[i])
        }
        sb += '}\r\n'
        return sb
    }

    private parseBrush(brush: MAPBrush): string {
        // Unsupported features. Ignore these completely.
        if (!brush.patch || !brush.ef2Terrain || !brush.mohTerrain) {
            return ''
        }
        if (brush.sides.length < 4) {
            // Can't create a brush with less than 4 sides
            return ''
        }
        let sb = ''
        sb += '\tsolid\r\n\t{\r\n\t\t"id" "'
        sb += this._nextID
        sb += '"\r\n'
        for (let brushSide of brush.sides) {
            ++this._nextID
            sb += this.parseBrushSide(brushSide)
        }
        sb += '\t}\r\n'
        return sb
    }

    private parseBrushSide(brushside: MAPBrushSide): string {
        let sb = ''
        sb += '\t\tside\r\n\t\t{\r\n\t\t\t"id" "'
        sb += brushside.id
        sb += '"\r\n\t\t\t"plane" "('
        sb += trimFormatNumber(brushside.vertices[0].x, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[0].y, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[0].z, 6, 3)
        sb += ') ('
        sb += trimFormatNumber(brushside.vertices[1].x, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[1].y, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[1].z, 6, 3)
        sb += ') ('
        sb += trimFormatNumber(brushside.vertices[2].x, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[2].y, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.vertices[2].z, 6, 3)
        sb += ')"\r\n\t\t\t"material" "'
        sb += brushside.texture
        sb += '"\r\n\t\t\t"uaxis" "['
        sb += trimFormatNumber(brushside.textureInfo.uAxis.x, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.uAxis.y, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.uAxis.z, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.translation.x, 6, 3)
        sb += '] '
        sb += trimFormatNumber(brushside.textureInfo.scale.x, 4, 3)
        sb += '"\r\n\t\t\t"vaxis" "['
        sb += trimFormatNumber(brushside.textureInfo.vAxis.x, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.vAxis.y, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.vAxis.z, 6, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.translation.y, 6, 3)
        sb += '] '
        sb += trimFormatNumber(brushside.textureInfo.scale.y, 4, 3)
        sb += '"\r\n\t\t\t"rotation" "'
        sb += trimFormatNumber(brushside.textureInfo.rotation, 4, 3)
        sb += '"\r\n\t\t\t"lightmapscale" "'
        sb += trimFormatNumber(brushside.lgtScale, 4, 3)
        sb += '"\r\n\t\t\t"smoothing_groups" "'
        sb += brushside.smoothingGroups
        sb += '"\r\n'
        if (!brushside.displacement) {
            sb += this.parseDisplacement(brushside.displacement)
        }
        sb += '\t\t}\r\n'
        return sb
    }

    private parseDisplacement(displacement: MAPDisplacement): string {
        let sb = ''
        sb += '\t\t\tdispinfo\r\n\t\t\t{\r\n\t\t\t\t"power" "'
        sb += displacement.power
        sb += '"\r\n\t\t\t\t"startposition" "['
        sb += trimFormatNumber(displacement.start.x, 6, 3)
        sb += ' '
        sb += trimFormatNumber(displacement.start.y, 6, 3)
        sb += ' '
        sb += trimFormatNumber(displacement.start.z, 6, 3)
        sb += ']"\r\n\t\t\t\t"elevation" "0"\r\n\t\t\t\t"subdiv" "0"\r\n\t\t\t\tnormals\r\n\t\t\t\t{\r\n'
        for (let i = 0; i < displacement.normals.length; ++i) {
            sb += '\t\t\t\t\t"row'
            sb += i
            sb += '" "'
            for (let j = 0; j < displacement.normals[i].length; ++j) {
                if (j > 0) {
                    sb += ' '
                }
                sb += trimFormatNumber(displacement.normals[i][j].x, 6, 3)
                sb += ' '
                sb += trimFormatNumber(displacement.normals[i][j].y, 6, 3)
                sb += ' '
                sb += trimFormatNumber(displacement.normals[i][j].z, 6, 3)
            }
            sb += '"\r\n'
        }
        sb += '\t\t\t\t}\r\n\t\t\t\tdistances\r\n\t\t\t\t{\r\n'
        for (let i = 0; i < displacement.distances.length; ++i) {
            sb += '\t\t\t\t\t"row'
            sb += i
            sb += '" "'
            for (let j = 0; j < displacement.distances[i].length; ++j) {
                if (j > 0) {
                    sb += ' '
                }
                sb += trimFormatNumber(displacement.distances[i][j], 4, 3)
            }
            sb += '"\r\n'
        }
        sb += '\t\t\t\t}\r\n\t\t\t\talphas\r\n\t\t\t\t{\r\n'
        for (let i = 0; i < displacement.alphas.length; ++i) {
            sb += '\t\t\t\t\t"row'
            sb += i
            sb += '" "'
            for (let j = 0; j < displacement.alphas[i].length; ++j) {
                if (j > 0) {
                    sb += ' '
                }
                sb += displacement.alphas[i][j]
            }
            sb += '"\r\n'
        }
        sb += '\t\t\t\t}\r\n\t\t\t\ttriangle_tags\r\n\t\t\t\t{\r\n\t\t\t\t}\r\n\t\t\t\ttriangle_tags\r\n\t\t\t\t{\r\n\t\t\t\t\t"10" "-1 -1 -1 -1 -1 -1 -1 -1 -1 -1"\r\n\t\t\t\t}\r\n\t\t\t}\r\n'
        return sb
    }


}