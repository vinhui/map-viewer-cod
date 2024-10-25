import {BSP, LumpInfo} from '../../BSP/BSP'
import {int} from '../../../../utils/number'

export interface ILump {
    bsp: BSP
    lumpInfo: LumpInfo
    length: int

    getBytes: (lumpOffset: int) => Uint8Array
}