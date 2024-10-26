import {TextureInfo} from '../../LibBSP/Structs/Common/TextureInfo'
import {ISize, Matrix, Vector2, Vector3} from '@babylonjs/core'

export class TextureInfoExtensions {
    public static BuildTexMatrix(textureInfo: TextureInfo): Matrix {
        const scaledUAxis = textureInfo.uAxis
        const scaledVAxis = textureInfo.vAxis
        const STNormal = scaledUAxis.cross(scaledVAxis)
        const texmatrix = Matrix.FromValues(
            scaledUAxis.x, scaledVAxis.x, STNormal.x, 0,
            scaledUAxis.y, scaledVAxis.y, STNormal.y, 0,
            scaledUAxis.z, scaledVAxis.z, STNormal.z, 0,
            0, 0, 0, 0,
        )
        return texmatrix
    }

    public static CalculateUV(textureInfo: TextureInfo, transformVertex: Vector3, dims: ISize): Vector2 {
        return new Vector2(
            (textureInfo.uAxis.magnitudeSquared * transformVertex.x + textureInfo.translation.x) / dims.width,
            (textureInfo.vAxis.magnitudeSquared * transformVertex.y + textureInfo.translation.y) / dims.height,
        )
    }
}