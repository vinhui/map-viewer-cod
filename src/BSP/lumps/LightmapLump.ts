import {Engine, RawTexture} from '@babylonjs/core'

export class LightmapLump {
    public lightMaps: RawTexture[] = []

    public static CreateLightMap(rgb: Uint8Array): RawTexture {
        const width = 128
        const height = 128
        const textureData = new Uint8Array(width * height * 4)
        let j = 0

        for (let i = 0; i < width * height; i++) {
            const r = LightmapLump.calcLight(rgb[j++])
            const g = LightmapLump.calcLight(rgb[j++])
            const b = LightmapLump.calcLight(rgb[j++])
            const a = 255 // Use 255 for full opacity (equivalent to 1f in Unity's Color32)

            textureData[i * 4] = r
            textureData[i * 4 + 1] = g
            textureData[i * 4 + 2] = b
            textureData[i * 4 + 3] = a
        }

        // Create the RawTexture with the processed data
        const texture = RawTexture.CreateRGBATexture(
            textureData,
            width,
            height,
            null,
            false,
            false,
            Engine.TEXTURE_NEAREST_SAMPLINGMODE,
        )

        return texture
    }

    private static calcLight(color: number): number {
        let icolor = color
        // icolor += 200; // Uncomment if needed

        if (icolor > 255) {
            icolor = 255
        }

        return icolor
    }
}
