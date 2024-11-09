import {FakeFileSystem, File} from 'libbsp-js'
import {BaseTexture, RawTexture, Scene, Texture} from '@babylonjs/core'
import {doesDdsHaveAlpha} from '../../utils/dds'
import {loadSkyTextureAtPath} from './Sky'

export function loadTextureAtPath(path: string, scene: Scene, onTexChanged: () => void): BaseTexture {
    const s = path.toLowerCase()
    if (s.includes('/sky/') || s.startsWith('/skies/')) {
        const skyTex = loadSkyTextureAtPath(path, scene, onTexChanged)
        if (skyTex) {
            return skyTex
        }
    }

    if (FakeFileSystem.hasLoadedIndex) {
        const matches = FakeFileSystem.FindFiles(path, null, false)
        if (matches.length === 0) {
            return null
        }

        for (let match of matches) {
            if (match.caseInsensitivePath === path.toLowerCase() || match.directory + match.nameWithoutExtension === path) {
                if (match.isLoaded) {
                    if (match.extension === '.ftx') {
                        return getFtxTexture(match, scene)
                    } else {
                        if (match.extension.toLowerCase() === '.dds') {
                            const view = new DataView(match.bytes.buffer)
                            // Some old DDS files have bits per pixels that are way too high
                            // So we're just limiting those
                            if (view.getInt32(22 * 4, true) >= 256) {
                                view.setInt32(22 * 4, 0, true)
                            }
                        }
                        const tex = new Texture(
                            'data:' + match.originalPath, // url
                            scene, // scene
                            null, // no mipmap or options
                            null, // inverty
                            null, // samplingmode
                            null, // onload
                            null, // onerror
                            match.bytes.buffer, // buffer
                            false, // delete buffer
                            null, // format
                            null, // mimetype
                            null, // loaderoptions
                            null, // creationflags
                            null, // forced extension
                        )
                        if (match.extension.toLowerCase() === '.dds') {
                            tex.hasAlpha = doesDdsHaveAlpha(match.bytes)
                        }
                        return tex
                    }
                } else {
                    if (match.extension === '.ftx') {
                        console.error(`Using FTX textures that aren't preloaded is currently not supported.\nYou need to pre-download them through the FakeFileSystem beforehand.`)
                        return null
                    }
                    let tex = new Texture(null, scene, false, true)
                    tex.name = match.originalPath
                    match.download()
                        .then(success => {
                            if (success) {
                                if (match.extension.toLowerCase() === '.dds') {
                                    const view = new DataView(match.bytes.buffer)
                                    // Some old DDS files have bits per pixels that are way too high
                                    // So we're just limiting those
                                    if (view.getInt32(22 * 4, true) >= 256) {
                                        view.setInt32(22 * 4, 0, true)
                                    }
                                }
                                tex.updateURL(
                                    'data:' + match.originalPath, // url
                                    match.bytes.buffer, // buffer
                                    null, // onload
                                    null, // forced extension
                                )
                                if (match.extension.toLowerCase() === '.dds') {
                                    tex.hasAlpha = doesDdsHaveAlpha(match.bytes)
                                }
                                onTexChanged()
                            } else {
                                console.error(`Downloading ${match.originalPath} failed while index indicated it should exist. Maybe index file is out of date?`)
                            }
                        })
                    return tex
                }
            }
        }
        return null
    } else {
        // Fallback to trying to download the file
        const tex = new Texture(null, scene)
        let responseCount = 0
        let foundMatch = false
        const extensions = ['dds', 'jpg', 'tga', 'gif', 'jpeg', 'png'].flatMap(x => [x, x.toUpperCase()])
        for (const extension of extensions) {
            const url = `${FakeFileSystem.baseUrl}${path}.${extension}`
            fetch(url, {method: 'HEAD'})
                .then((res) => {
                    responseCount++
                    if (res.ok) {
                        foundMatch = true
                        tex.updateURL(url)
                    }
                    if (responseCount === extensions.length) {
                        onTexChanged()
                        if (!foundMatch) {
                            console.error(`Failed to find texture ${path}`)
                        }
                    }
                })
        }
        return tex
    }
}

export function getFtxTexture(file: File, scene: Scene) {
    const bytes = file.bytes
    if (bytes.byteLength < 12) {
        console.warn(`Invalid FTX texture file "${file.originalPath}": File too small`)
        return null
    }
    const view = new DataView(bytes.buffer)
    const width = view.getInt32(0)
    const height = view.getInt32(4)

    if (bytes.byteLength < (width * height * 4) + 12) {
        console.warn(`Invalid FTX texture file "${file.originalPath}": Not enough pixels`)
        return null
    }

    const tex = RawTexture.CreateRGBATexture(bytes.slice(12), width, height, scene, true, false)
    tex.name = file.originalPath
    return tex
}
