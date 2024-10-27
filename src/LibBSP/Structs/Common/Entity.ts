import {ILump} from './Lumps/ILump'
import {BSP, LumpInfo, MapType} from '../BSP/BSP'
import {Vector3} from '@babylonjs/core'
import {StringExtensions} from '../../Extensions/StringExtensions'
import {Vector4} from '../../Util/Vector'
import {ILumpObject, LumpObjDataCtor} from './ILumpObject'
import {float, int, numberToStringUS, parseFloatUS, uint} from '../../../utils/number'
import {Entities} from './Lumps/Entities'
import {MAPBrush} from '../MAP/MAPBrush'

export class EntityConnection {
    public name: string
    public target: string
    public action: string
    public param: string
    public delay: float
    public fireOnce: int
    // These exist in Dark Messiah only.
    public unknown0: string
    public unknown1: string

    public toString(mapType?: MapType): string {
        mapType = mapType ?? MapType.Undefined

        const formattedDelay = numberToStringUS(this.delay)

        if (mapType === MapType.DMoMaM) {
            return `"${this.name}" "${this.target},${this.action},${this.param},${formattedDelay},${this.fireOnce},${this.unknown0},${this.unknown1}"`
        } else {
            return `"${this.name}" "${this.target},${this.action},${this.param},${formattedDelay},${this.fireOnce}"`
        }
    }
}

export class Entity extends ILumpObject<Entity> {
    public static readonly ConnectionMemberSeparater = String.fromCharCode(0x1B)
    public connections: EntityConnection[]
    public brushes: MAPBrush[]
    private _map: Map<string, string>

    public get map(): Map<string, string> {
        return this._map
    }

    get data(): Uint8Array {
        return new TextEncoder().encode(this.toString())
    }

    public set data(value: Uint8Array) {
        this.parseString(new TextDecoder().decode(value))
    }

    public get isBrushBased(): boolean {
        return this.brushes.length > 0 || this.modelNumber >= 0
    }

    public get spawnFlags(): uint {
        try {
            if (this._map.has('spawnflags')) {
                return Number.parseInt(this.get('spawnflags'), 10)
            } else {
                return 0
            }
        } catch (_) {
            return 0
        }
    }

    public set spawnFlags(val: uint) {
        this._map.set('spawnflags', val.toString())
    }

    public get origin(): Vector3 {
        const v = this.getVector('origin')
        return new Vector3(v.x, v.y, v.z)
    }

    public set origin(val: Vector3) {
        this._map.set('origin', `${numberToStringUS(val.x)} ${numberToStringUS(val.y)} ${numberToStringUS(val.z)}`)
    }

    public get angles(): Vector3 {
        const v = this.getVector('angles')
        return new Vector3(v.x, v.y, v.z)
    }

    public set angles(val: Vector3) {
        this._map.set('angles', `${numberToStringUS(val.x)} ${numberToStringUS(val.y)} ${numberToStringUS(val.z)}`)
    }

    public get name(): string {
        if (this._map.has('targetname')) {
            return this.get('targetname')
        } else if (this._map.has('name')) {
            return this.get('name')
        } else {
            return ''
        }
    }

    public set name(val: string) {
        this._map.set('targetname', val)
    }

    public get className(): string {
        if (this._map.has('classname')) {
            return this.get('classname')
        } else {
            return ''
        }
    }

    public set className(val: string) {
        this._map.set('classname', val)
    }

    public get model(): string {
        if (this._map.has('model')) {
            return this.get('model')
        } else {
            return null
        }
    }

    public set model(val: string) {
        this._map.set('model', val)
    }

    public get modelNumber(): int {
        try {
            if (this.get('classname') === 'worldspawn') {
                return 0
            } else {
                if (this._map.has('model')) {
                    let st = this.get('model')
                    if (st[0] === '*') {
                        let ret = Number.parseInt(st.substring(1))
                        if (!isNaN(ret)) {
                            return ret
                        }
                    }
                }
            }
            return -1
        } catch (e) {
            return -1
        }
    }

    public static CreateWithClass(className: string, parent?: ILump) {
        const e = new Entity(new LumpObjDataCtor(new Uint8Array(0), parent))
        e.set('classname', className)
        return e
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Entities {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const l = new Entities(Entity, null, bsp, lumpInfo)
        l.fromData(data)
        return l
    }

    public static GetIndexForLump(type: MapType): int {

        if (type === MapType.BlueShift) {
            return 1
        } else if (type === MapType.MOHAADemo) {
            return 15
        } else if (MapType.IsSubtypeOf(type, MapType.Source)
            || MapType.IsSubtypeOf(type, MapType.Quake)
            || MapType.IsSubtypeOf(type, MapType.Quake2)) {
            return 0
        } else if (MapType.IsSubtypeOf(type, MapType.STEF2)) {
            return 16
        } else if (MapType.IsSubtypeOf(type, MapType.FAKK2)
            || MapType.IsSubtypeOf(type, MapType.MOHAA)) {
            return 14
        } else if (type === MapType.CoD
            || type === MapType.CoDDemo) {
            return 29
        } else if (type === MapType.CoD2) {
            return 37
        } else if (type === MapType.CoD4) {
            return 39
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)
            || type === MapType.Nightfire) {
            return 0
        }

        return -1
    }

    public get(key: string) {
        if (this._map.has(key)) {
            return this._map.get(key)
        }
        return ''
    }

    public set(key: string, value: string) {
        this._map.set(key, value)
    }

    public has(key: string) {
        return this._map.has(key)
    }

    public parseString(st: string) {
        if (!this._map) {
            this._map = new Map()
        }
        this._map.clear()
        this.brushes = []
        this.connections = []

        const lines = StringExtensions.SplitUnlessInContainer(st, '\n', '"')
        let braceCount = 0
        let inConnections = false
        let inBrush = false

        let brushLines = []

        for (let line of lines) {
            let current = line.replace(/^[ \t\r]+|[ \t\r]+$/g, '')

            let inQuotes = false
            for (let i = 0; i < current.length; i++) {
                if (current[i] === '"') {
                    if (i === 0) {
                        inQuotes = !inQuotes
                    } else if (current[i - 1] !== '\\') {
                        if (inQuotes && (i + 1 >= current.length || current[i + 1] === '\n' || current[i + 1] === '\r')) {
                            inQuotes = false
                        }
                    } else {
                        inQuotes = !inQuotes
                    }
                }

                if (!inQuotes && current[i] === '/' && i !== 0 && current[i - 1] === '/') {
                    current = current.substring(0, i - 1)
                }
            }

            if (!current || current.length === 0) {
                continue
            }

            if (current[0] === '{') {
                if (braceCount === 1 && !inBrush && !inConnections) {
                    inBrush = true
                }
                ++braceCount
            } else if (current[0] === '}') {
                --braceCount
                if (braceCount === 1) {
                    if (inBrush) {
                        brushLines.push(current)
                        this.brushes.push(new MAPBrush(brushLines))
                        brushLines = []
                    }
                    inBrush = false
                    inConnections = false
                } else {
                    brushLines.push(current)
                }
                continue
            } else if (current.length >= 5 && current.substring(0, 5) === 'solid') {
                inBrush = true
                continue
            } else if (current.length >= 11 && current.substring(0, 11) === 'connections') {
                inConnections = true
                continue
            }

            if (inBrush) {
                brushLines.push(current)
                continue
            }

            this.add(current)
        }
    }

    public renameKey(oldName: string, newName: string) {
        if (this._map.has(oldName)) {
            const val = this.get(oldName)
            this._map.delete(oldName)
            this.set(newName, val)
        }
    }

    public add(st: string) {
        let key = ''
        let val = ''
        let inQuotes = false
        let isVal = false
        let numCommas = 0

//         st = st.replace(/^[\r\n\t]+|[\r\n\t]+$/g, '');
        for (let i = 0; i < st.length; i++) {
            if (st[i] === '"' && (i === 0 || i === st.length - 1 || st[i - 1] !== '\\')) {
                if (inQuotes) {
                    if (isVal) {
                        break
                    }
                    isVal = true
                }
                inQuotes = !inQuotes
            } else {
                if (inQuotes) {
                    if (!isVal) {
                        key += st[i]
                    } else {
                        val += st[i]
                        if (st[i] === ',' || st[i] === Entity.ConnectionMemberSeparater) {
                            ++numCommas
                        }
                    }
                }
            }
        }
        // val = val.replace(/\\"/g, '"')
        if (key !== null && key !== undefined && isVal) {
            if (numCommas === 4 || numCommas === 6) {
                st = st.replace(',', Entity.ConnectionMemberSeparater)
                let connection = val.split(',')
                if (connection.length < 5) {
                    connection = val.split(String.fromCharCode(0x1B))
                }
                if (connection.length === 5 || connection.length === 7) {
                    try {
                        const ec = new EntityConnection()
                        ec.name = key
                        ec.target = connection[0]
                        ec.action = connection[1]
                        ec.param = connection[2]
                        ec.delay = parseFloatUS(connection[3])
                        ec.fireOnce = Number.parseInt(connection[4], 10)
                        ec.unknown0 = connection.length > 5 ? connection[5] : ''
                        ec.unknown1 = connection.length > 6 ? connection[6] : ''
                        this.connections.push(ec)
                    } catch (e) {
                        if (!this._map.has(key)) {
                            this.set(key, val)
                        }
                    }
                }
            } else {
                if (!this._map.has(key)) {
                    this.set(key, val)
                }
            }
        }
    }

    public toString() {
        let output = ''
        output += '{\n'
        for (let [key, val] of this._map.entries()) {
            output += `"${key}" "${val}",\n`
        }
        if (this.connections.length > 0) {
            for (let c of this.connections) {
                output += c.toString(this.mapType) + '\n'
            }
        }

        return output + '}\n'
    }

    public valueIs(key: string, val: string) {
        return val.localeCompare(this.get(key), undefined, {sensitivity: 'base'}) === 0
    }

    public spawnFlagsSet(bits: uint): boolean {
        return (this.spawnFlags & bits) === bits
    }

    public toggleSpawnFlags(bits: uint) {
        this.spawnFlags ^= bits
    }

    public SetSpawnFlags(bits: uint) {
        this.spawnFlags |= bits
    }

    public getFloat(key: string, failDefault?: float): float {
        try {
            return parseFloatUS(this.get(key))
        } catch (e) {
            if (failDefault) {
                return failDefault
            } else {
                throw e
            }
        }
    }

    public getInt(key: string, failDefault?: int): int {
        try {
            const val = Number.parseInt(this.get(key), 10)
            if (isNaN(val)) {
                if (failDefault) {
                    return failDefault
                } else {
                    throw new Error('Invalid format')
                }
            }
        } catch (e) {
            if (failDefault) {
                return failDefault
            } else {
                throw e
            }
        }
    }

    public getVector(key: string): Vector4 {
        const results: float[] = []
        const val = this._map.get(key)
        if (this._map.has(key) && val && val.length > 0) {
            const nums = val.split(' ')
            for (let i = 0; i < results.length && i < nums.length; i++) {
                try {
                    results[i] = parseFloatUS(nums[i])
                } catch (e) {
                    results[i] = 0
                }
            }
        }
        return new Vector4(results[0], results[1], results[2], results[3])
    }

    public compareTo(obj: unknown) {
        if (!obj) {
            return 1
        }
        if (!(obj instanceof Entity)) {
            throw new Error('Object is not an Entity')
        }

        const comparison = this.className.localeCompare(obj.className)
        return comparison !== 0 ? comparison : this.name.localeCompare(obj.name)
    }

    protected ctorCopy(source: Entity, parent: ILump) {
        this.connections = source.connections.slice()
        this.brushes = source.brushes.slice()
        this._parent = parent
    }
}