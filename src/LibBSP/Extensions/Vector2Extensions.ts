import {Vector2} from '../Utils/Vector'
import {int} from '../../utils/number'

export class Vector2Extensions {
    public static ToVector2(data: Uint8Array, startIndex: int = 0): Vector2 {
        const view = new DataView(data.buffer)
        return new Vector2(
            view.getFloat32(startIndex),
            view.getFloat32(startIndex + 4),
        )
    }
}