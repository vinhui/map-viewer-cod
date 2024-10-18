import {Scene, Texture} from '@babylonjs/core'
import {BSPTexture} from '../types/BSPTexture'

export class TextureLump {
    public textures: BSPTexture[] = []
    private readyTextures: Map<string, Texture> = new Map()

    public get textureCount(): number {
        return this.textures.length
    }

    public containsTexture(textureName: string): boolean {
        return this.readyTextures.has(textureName)
    }

    public getTexture(textureName: string): Texture | undefined {
        return this.readyTextures.get(textureName)
    }

    public async pullInTextures(baseURL: string, scene: Scene): Promise<void> {
        await this.loadTextures(baseURL, scene)
    }

    public printInfo(): string {
        let blob = ''
        this.textures.forEach((tex, index) => {
            blob += `Texture ${index} Name: ${tex.name.trim()}\tFlags: ${tex.flags}\tContents: ${tex.contents}\r\n`
        })
        return blob
    }

    private async loadTextures(baseURL: string, scene: Scene): Promise<void> {
        const formats = ['.ktx', '.ktx2', '.basis', '.jpg', '.png', '.tga', '.webp', '.gif'] // Array of possible texture formats

        for (const tex of this.textures) {
            console.log(this.textures)
            let textureLoaded = false // Flag to check if the texture was successfully loaded

            for (const format of formats) {
                const textureURL = `${baseURL}/${tex.name}${format}`
                try {
                    const response = await fetch(textureURL)
                    if (!response.ok) {
                        continue // Skip if the texture in this format is not found
                    }

                    const blob = await response.blob()
                    const memoryUrl = URL.createObjectURL(blob)

                    const texture = new Texture(
                        memoryUrl, scene,
                        false, true, Texture.TRILINEAR_SAMPLINGMODE,
                        null, (e) => {
                            console.error('Failed to load texture', textureURL, e)
                        }, null, null, null, null, null, null,
                        format,
                    )

                    this.readyTextures.set(tex.name, texture)
                    textureLoaded = true // Mark the texture as loaded successfully
                    break // Stop checking other formats once the texture is found
                } catch (error) {
                    console.error(`Failed to load texture ${tex.name}${format}:`, error)
                }
            }

            if (!textureLoaded) {
                // Throw an error if none of the formats worked for this texture
                throw new Error(`Could not load texture '${tex.name}' in any of the formats: ${formats.join(', ')}`)
            }
        }
    }
}
