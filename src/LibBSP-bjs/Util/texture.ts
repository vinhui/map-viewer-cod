import {FakeFileSystem} from 'libbsp-js'
import {BaseTexture, RawTexture, Scene, Texture} from '@babylonjs/core'
import {doesDdsHaveAlpha} from '../../utils/dds'
import {loadDDSFromMemory} from './dds'

function getTextureFromBuffer(extension: string, arrayBuffer: ArrayBuffer, path: string, scene: Scene): Promise<BaseTexture> {
    let tex: BaseTexture
    if (extension === '.ftx') {
        const bytes = new Uint8Array(arrayBuffer)
        tex = getFtxTexture(bytes, path, scene)
    } else if (extension === '.dds') {
        const bytes = new Uint8Array(arrayBuffer)
        tex = getDdsTexture(bytes, path, scene)
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