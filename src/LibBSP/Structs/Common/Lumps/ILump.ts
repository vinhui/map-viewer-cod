import {BSP, LumpInfo} from '../../BSP/BSP'

export interface ILump {
    bsp: BSP
    lumpInfo: LumpInfo
    length: int

    getBytes: (lumpOffset: int) => Uint8Array
}