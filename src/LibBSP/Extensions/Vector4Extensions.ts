import {Vector4} from '../Utils/Vector'

export class Vector4Extensions {
    public static ToVector4(data: Uint8Array, startIndex: int = 0): Vector4 {
        const view = new DataView(data.buffer)
        return new Vector4(
            view.getFloat32(startIndex),
            view.getFloat32(startIndex + 4),
            view.getFloat32(startIndex + 8),
            view.getFloat32(startIndex + 12),
        )
    }
}