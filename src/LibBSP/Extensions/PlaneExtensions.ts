import {Vector3} from '../Utils/Vector'
import {Plane} from '../Utils/Plane'
import {BSP, LumpInfo, MapType} from '../Structs/BSP/BSP'
import {Lump} from '../Structs/Common/Lumps/Lump'
import {Vector3Extensions} from './Vector3Extensions'

export class PlaneExtensions {
    public static readonly baseAxes: Vector3[] = [
        new Vector3(0, 0, 1), new Vector3(1, 0, 0), new Vector3(0, -1, 0),
        new Vector3(0, 0, -1), new Vector3(1, 0, 0), new Vector3(0, -1, 0),
        new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, -1),
        new Vector3(-1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, -1),
        new Vector3(0, 1, 0), new Vector3(1, 0, 0), new Vector3(0, 0, -1),
        new Vector3(0, -1, 0), new Vector3(1, 0, 0), new Vector3(0, 0, -1),
    ]

    public static CreateFromVertices(p1: Vector3, p2: Vector3, p3: Vector3): Plane {
        if (isNaN(p1.x) || isNaN(p1.y) || isNaN(p1.z) ||
            isNaN(p2.x) || isNaN(p2.y) || isNaN(p2.z) ||
            isNaN(p3.x) || isNaN(p3.y) || isNaN(p3.z) ||
            p1.add(p2).cross(p1.add(p3)).magnitude == 0) {
            return new Plane(new Vector3(0, 0, 0), 0)
        }

        return Plane.CreateFromVertices(p1, p2, p3)
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Plane> {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const view = new DataView(data.buffer)

        const structLength = this.GetStructLength(bsp.mapType, lumpInfo.version)
        const numObjects = data.length / structLength
        const arr: Plane[] = []
        for (let i = 0; i < numObjects; i++) {
            const normal = Vector3Extensions.ToVector3(data, structLength * i)
            const d = view.getFloat32(structLength * i)
            arr.push(new Plane(normal, d))
        }
        return new Lump(Plane, arr, bsp, lumpInfo)
    }

    public static GetBytes(p: Plane, type: MapType, version: int = 0, targetArray?: Uint8Array, offset?: int): Uint8Array {
        const bytes = targetArray ?? new Uint8Array(this.GetStructLength(type, version))
        offset = offset ?? 0

        const view = new DataView(bytes.buffer)

        if (MapType.IsSubtypeOf(type, MapType.Quake)
            || MapType.IsSubtypeOf(type, MapType.Quake2)
            || MapType.IsSubtypeOf(type, MapType.Source)
            || type == MapType.Nightfire) {
            view.setInt32(16 + offset, this.Type(p))
        }

        p.normal.getBytes(bytes, offset)
        view.setFloat32(12 + offset, p.d)
        return bytes
    }

    public static BestAxis(p: Plane): int {
        let bestAxis = 0
        let best = 0
        for (let i = 0; i < 6; i++) {
            const dot = p.normal.dot(this.baseAxes[i * 3])
            if (dot > best) {
                best = dot
                bestAxis = i
            }
        }
        return bestAxis
    }

    public static Type(p: Plane): int {
        const n = p.normal
        const ax = Math.abs(n.x)
        if (ax >= 1) {
            return 0
        }

        const ay = Math.abs(n.y)
        if (ay >= 1) {
            return 1
        }

        const az = Math.abs(n.z)
        if (az >= 1) {
            return 2
        }

        if (ax >= ay && ax >= az) {
            return 3
        }
        if (ay >= ax && ay >= az) {
            return 4
        }
        return 5
    }

    public static GetIndexForLump(type: MapType) {
        if (type === MapType.BlueShift) {
            return 0
        } else if (MapType.IsSubtypeOf(type, MapType.Source)
            || MapType.IsSubtypeOf(type, MapType.Quake)
            || MapType.IsSubtypeOf(type, MapType.Quake2)
            || MapType.IsSubtypeOf(type, MapType.UberTools)
            || type === MapType.Nightfire
        ) {
            return 1
        } else if (type === MapType.CoD2 || type === MapType.CoD4) {
            return 4
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)) {
            return 2
        }
        return -1
    }

    public static GetStructLength(type: MapType, version: int): int {
        if (type === MapType.Titanfall
            || MapType.IsSubtypeOf(type, MapType.Quake3)
        ) {
            return 16
        } else if (type === MapType.Nightfire
            || MapType.IsSubtypeOf(type, MapType.Quake)
            || MapType.IsSubtypeOf(type, MapType.Quake2)
            || MapType.IsSubtypeOf(type, MapType.Source)
        ) {
            return 20
        }
        return 0
    }
}