import {Vector3} from '../Utils/Vector'
import {BSP, LumpInfo, MapType} from '../Structs/BSP/BSP'
import {Lump} from '../Structs/Common/Lumps/Lump'

export class Vector3Extensions {


    public static ToVector3(bytes: Uint8Array | DataView, startIndex: int = 0): Vector3 {
        let view: DataView
        if (bytes instanceof Uint8Array) {
            view = new DataView(bytes.buffer)
        } else {
            view = bytes
        }
        return new Vector3(
            view.getFloat32(startIndex),
            view.getFloat32(startIndex + 4),
            view.getFloat32(startIndex + 8),
        )
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Vector3> {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const structLength = this.GetStructLength(bsp.mapType, lumpInfo.version)
        const numObjects = data.length / structLength
        const arr: Vector3[] = []
        for (let i = 0; i < numObjects; i++) {
            arr.push(this.ToVector3(data, i * structLength))
        }
        return new Lump(Vector3, arr, bsp, lumpInfo)
    }

    public static GetIndexForNormalsLump(type: MapType): int {
        if (type === MapType.Nightfire) {
            return 5
        }
        return -1
    }

    public static GetIndexForPatchVertsLump(type: MapType): int {
        if (type === MapType.CoD || type === MapType.CoDDemo) {
            return 25
        }
        return -1
    }

    public static GetStructLength(type: MapType, version: int): int {
        return 12
    }
}