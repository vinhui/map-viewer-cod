import {MAPBrushSide} from './MAPBrushSide'
import {MAPPatch} from './MAPPatch'
import {MAPTerrainEF2} from './MAPTerrainEF2'
import {MAPTerrainMoHAA} from './MAPTerrainMoHAA'

export class MAPBrush {
    public sides: MAPBrushSide[]
    public patch: MAPPatch
    public ef2Terrain: MAPTerrainEF2
    public mohTerrain: MAPTerrainMoHAA

    public isDetail = false
    public isWater = false
    public isLava = false
    public isManVis = false


    constructor(lines?: string[]) {
        if (!lines) {
            return
        }

        let braceCount = 0
        let brushDef3 = false
        let inPatch = false
        let inTerrain = false
        let child: string[] = []
        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i]

            if (line[0] == '{') {
                braceCount++
                if (braceCount == 1 || brushDef3) {
                    continue
                }
            } else if (line[0] == '}') {
                braceCount--
                if (braceCount == 0 || brushDef3) {
                    continue
                }
            }

            if (braceCount == 1 || brushDef3) {
                // Source engine
                if (line.length >= 'side'.length && line.substring(0, 'side'.length) == 'side') {

                }
                // id Tech does this kinda thing
                else if (line.length >= 'patch'.length && line.substring(0, 'patch'.length) == 'patch') {
                    inPatch = true
                    // Gonna need this line too. We can switch on the type of patch definition, make things much easier.
                    child.push(line)

                } else if (inPatch) {
                    child.push(line)
                    inPatch = false
                    this.patch = new MAPPatch(child)
                    child = []

                } else if (line.length >= 'terrainDef'.length && line.substring(0, 'terrainDef'.length) == 'terrainDef') {
                    inTerrain = true
                    child.push(line)

                } else if (inTerrain) {
                    child.push(line)
                    inTerrain = false
                    // TODO: MoHRadiant terrain
                    this.ef2Terrain = new MAPTerrainEF2(child)
                    child = []

                } else if (line.length >= 'brushDef3'.length && line.substring(0, 'brushDef3'.length) == 'brushDef3') {
                    brushDef3 = true

                } else if (line == '"BRUSHFLAGS" "DETAIL"') {
                    this.isDetail = true

                } else if (line.length >= '"id"'.length && line.substring(0, '"id"'.length) == '"id"') {

                } else {
                    child.push(line)
                    this.sides.push(new MAPBrushSide(child))
                    child = []
                }
            } else if (braceCount > 1) {
                child.push(line)
            }
        }
    }
}