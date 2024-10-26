import {Vector4} from '../Util/Vector'
import {int} from '../../utils/number'

export class Vector4Extensions {
    public static ToVector4(data: Uint8Array, startIndex: int = 0): Vector4 {
        const view = new DataView(data.buffer)
        return new Vector4(
            view.getFloat32(startIndex, true),
            view.getFloat32(startIndex + 4, true),
            view.getFloat32(startIndex + 8, true),
            view.getFloat32(startIndex + 12, true),
        )
    }
}