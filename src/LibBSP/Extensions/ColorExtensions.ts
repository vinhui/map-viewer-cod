import {byte} from '../../utils/number'
import {Color} from '../Util/Color'

export class ColorExtensions {
    public static FromArgb(a: byte, r: byte, g: byte, b: byte): Color {
        return new Color(r, g, b, a)
    }
}