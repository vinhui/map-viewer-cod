import {Entities} from '../Structs/Common/Lumps/Entities'
import {Entity} from '../Structs/Common/Entity'
import {int, trimFormatNumber} from '../../utils/number'
import {MAPBrush} from '../Structs/MAP/MAPBrush'
import {MAPBrushSide} from '../Structs/MAP/MAPBrushSide'

function formatNumber(value: number, decimalPlaces: number, beforeDecimalPlaces: number = 4): string {
    let formatted = value.toFixed(decimalPlaces)

    const [whole, decimal] = formatted.split('.')
    if (whole.length > beforeDecimalPlaces) {
        formatted = whole.slice(-beforeDecimalPlaces) + (decimal ? '.' + decimal : '')
    }

    return formatted
}

export class GearcraftMapWriter {
    private _entities: Entities

    constructor(from: Entities) {
        this._entities = from
    }

    public parseMap(): string {
        // This initial buffer is probably too small (512kb) but should minimize the amount of allocations needed.
        let sb = ''
        for (let i = 0; i < this._entities.length; ++i) {
            sb += this.parseEntity(this._entities.get(i), i)
        }
        return sb
    }

    private parseEntity(entity: Entity, index: int): string {
        let sb = '{ // Entity '
        sb += index.toString()
        sb += '\r\n'
        for (let [key, value] of entity.map.entries()) {
            sb += '"'
            sb += key
            sb += '" "'
            sb += value
            sb += '"\r\n'
        }
        for (let i = 0; i < entity.brushes.length; ++i) {
            this.parseBrush(entity.brushes[i], i)
        }
        sb += '}\r\n'
        return sb
    }

    private parseBrush(brush: MAPBrush, index: int): string {
        // Unsupported features. Ignore these completely.
        if (!brush.patch || !brush.ef2Terrain || !brush.mohTerrain) {
            return ''
        }
        if (brush.sides.length < 4) {
            // Can't create a brush with less than 4 sides
            return ''
        }
        let sb = '{ // Brush '
        sb += index.toString()
        sb += '\r\n'
        if (brush.isDetail) {
            sb += '"BRUSHFLAGS" "DETAIL"\r\n'
        }
        for (let brushSide of brush.sides) {
            sb += this.parseBrushSide(brushSide)
        }
        sb += '}\r\n'
        return sb
    }

    private parseBrushSide(brushside: MAPBrushSide): string {
        let sb = '( '
        sb += formatNumber(brushside.vertices[0].x, 4, 6)
        sb += ' '
        sb += formatNumber(brushside.vertices[0].y, 4, 6)
        sb += ' '
        sb += formatNumber(brushside.vertices[0].z, 4, 6)
        sb += ' ) ( '
        sb += formatNumber(brushside.vertices[1].x, 4, 6)
        sb += ' '
        sb += formatNumber(brushside.vertices[1].y, 4, 6)
        sb += ' '
        sb += formatNumber(brushside.vertices[1].z, 4, 6)
        sb += ' ) ( '
        sb += formatNumber(brushside.vertices[2].x, 4, 6)
        sb += ' '
        sb += formatNumber(brushside.vertices[2].y, 4, 6)
        sb += ' '
        sb += formatNumber(brushside.vertices[2].z, 4, 6)
        sb += ' ) '
        sb += brushside.texture
        sb += ' [ '
        sb += trimFormatNumber(brushside.textureInfo.uAxis.x, 4, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.uAxis.y, 4, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.uAxis.z, 4, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.translation.x, 4, 3)
        sb += ' ] [ '
        sb += trimFormatNumber(brushside.textureInfo.vAxis.x, 4, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.vAxis.y, 4, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.vAxis.z, 4, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.translation.y, 4, 3)
        sb += ' ] '
        sb += trimFormatNumber(brushside.textureInfo.rotation, 4, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.scale.x, 4, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.textureInfo.scale.y, 4, 3)
        sb += ' '
        sb += brushside.textureInfo.flags
        sb += ' '
        sb += brushside.material
        sb += ' [ '
        sb += trimFormatNumber(brushside.lgtScale, 4, 3)
        sb += ' '
        sb += trimFormatNumber(brushside.lgtRot, 4, 3)
        sb += ' ]\r\n'
        return sb
    }
}