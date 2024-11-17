import {FakeFileSystem, File} from 'libbsp-js'
import {BaseTexture, Engine, RawTexture, Scene, Texture} from '@babylonjs/core'
import {doesDdsHaveAlpha} from '../../utils/dds'
import {loadDDSFromMemory} from './dds'
import TgaLoader from 'tga-js'

let shadersLoadPromise: Promise<(File | null)[]>
let scriptFiles: File[]

export async function findTextureFromShader(texturePath: string, propertyName: string | string[]) {
    if (!scriptFiles) {
        if (shadersLoadPromise) {
            await shadersLoadPromise
        } else {
            const files = FakeFileSystem.FindFiles('scripts/', /\.shader$/i, false)
            shadersLoadPromise = FakeFileSystem.DownloadFiles(files)
            await shadersLoadPromise
            scriptFiles = files
            shadersLoadPromise = null
        }
    }

    for (let scriptFile of scriptFiles) {
        if (!scriptFile.text) {
            continue
        }

        const lines = scriptFile.text.split('\n')
        let shaderMatch = false
        for (let line of lines) {
            line = line.trim()
            if (line === texturePath) {
                shaderMatch = true
                continue
            }
            if (shaderMatch) {
                if (Array.isArray(propertyName)) {
                    for (let name of propertyName) {
                        if (line.startsWith(name)) {
                            const split = line.split(' ')
                            return split[1]
                        }
                    }
                } else {
                    if (line.startsWith(propertyName)) {
                        const split = line.split(' ')
                        return split[1]
                    }
                }
                if (line.includes('}')) {
                    break
                }
            }
        }
    }

    return null
}

async function getTextureFromBuffer(extension: string, arrayBuffer: ArrayBuffer, path: string, scene: Scene): Promise<BaseTexture> {
    let tex: BaseTexture
    if (extension === '.ftx') {
        const bytes = new Uint8Array(arrayBuffer)
        tex = getFtxTexture(bytes, path, scene)
    } else if (extension === '.dds') {
        const bytes = new Uint8Array(arrayBuffer)
        tex = getDdsTexture(bytes, path, scene)
    } else if (extension === '.tga') {
        const bytes = new Uint8Array(arrayBuffer)
        const loader = new TgaLoader()
        loader.load(bytes)
        let format: number
        if (loader.header.pixelDepth === 32) {
            format = Engine.TEXTUREFORMAT_RGBA
        } else {
            format = Engine.TEXTUREFORMAT_RGB
        }

        tex = new RawTexture(
            loader.imageData,
            loader.header.width,
            loader.header.height,
            format,
            scene,
            true,
            true,
        )
        tex.name = path
        tex.hasAlpha = loader.header.pixelDepth === 32
    } else {
        return new Promise<BaseTexture>((resolve, reject) => {
            tex = new Texture(
                'data:' + path, // url
                scene, // scene
                null, // no mipmap or options
                null, // inverty
                null, // samplingmode
                () => {
                    tex.wrapU = Texture.WRAP_ADDRESSMODE
                    tex.wrapV = Texture.WRAP_ADDRESSMODE
                    tex.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE)

                    if (extension === '.tga') {
                        tex.hasAlpha = true
                    }
                    resolve(tex)
                }, // onload
                null, // onerror
                arrayBuffer, // buffer
                false, // delete buffer
                null, // format
                null, // mimetype
                null, // loaderoptions
                null, // creationflags
                null, // forced extension
            )
        })
    }

    tex.wrapU = Texture.WRAP_ADDRESSMODE
    tex.wrapV = Texture.WRAP_ADDRESSMODE
    tex.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE)
    return new Promise<BaseTexture>(resolve => {
        resolve(tex)
    })
}

export async function loadTextureAtPath(path: string, scene: Scene): Promise<BaseTexture> {
    if (FakeFileSystem.hasLoadedIndex) {
        const matches = FakeFileSystem.FindFiles(path, null, false)
        if (matches.length === 0) {
            // Fallback to checking the shader files
            const shaderTexPath = await findTextureFromShader(path, 'map')
            if (shaderTexPath) {
                return loadTextureAtPath(shaderTexPath, scene)
            }
            return null
        }

        for (let match of matches) {
            if (match.caseInsensitivePath === path.toLowerCase() || match.directory + match.nameWithoutExtension === path) {
                const extension = match.extension.toLowerCase()
                await match.download()
                if (match.failedToDownload) {
                    console.error(`Downloading ${match.originalPath} failed while index indicated it should exist. Maybe index file is out of date?`)
                    return null
                }

                return getTextureFromBuffer(extension, match.bytes.buffer, match.originalPath, scene)
            }
        }
        return null
    } else {
        // Fallback to trying to download the file
        const extensions = ['dds', 'jpg', 'tga', 'gif', 'jpeg', 'png'].flatMap(x => [x, x.toUpperCase()])
        for (const extension of extensions) {
            const url = `${FakeFileSystem.baseUrl}${path}.${extension}`
            const headerRes = await fetch(url, {method: 'HEAD'})

            if (headerRes.ok) {
                const res = await fetch(url)
                const arrayBuffer = await res.arrayBuffer()

                return getTextureFromBuffer(extension, arrayBuffer, path, scene)
            }
        }

        // Fallback to checking the shader files
        const shaderTexPath = await findTextureFromShader(path, 'map')
        if (shaderTexPath) {
            return loadTextureAtPath(shaderTexPath, scene)
        }
        console.error(`Failed to find texture ${path}`)
    }
}

export function getFtxTexture(bytes: Uint8Array, name: string, scene: Scene) {
    if (bytes.byteLength < 12) {
        console.warn(`Invalid FTX texture file "${name}": File too small`)
        return null
    }
    const view = new DataView(bytes.buffer)
    const width = view.getInt32(0)
    const height = view.getInt32(4)

    if (bytes.byteLength < (width * height * 4) + 12) {
        console.warn(`Invalid FTX texture file "${name}": Not enough pixels`)
        return null
    }

    const tex = RawTexture.CreateRGBATexture(bytes.slice(12), width, height, scene, true, false)
    tex.name = name
    return tex
}

export function getDdsTexture(bytes: Uint8Array, name: string, scene: Scene) {
    const ddsImage = loadDDSFromMemory(bytes)
    if (!ddsImage) {
        console.error(`Failed to load DDS image`, name)
        return null
    }

    const tex = RawTexture.CreateRGBATexture(
        ddsImage.pixels,
        ddsImage.header.width,
        ddsImage.header.height,
        scene,
        true,
        true,
    )
    tex.name = name
    tex.hasAlpha = doesDdsHaveAlpha(bytes)
    return tex
}