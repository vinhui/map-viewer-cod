import {CubeTexture, Scene, Texture} from '@babylonjs/core'
import {FakeFileSystem, File} from 'libbsp-js'
import mime from 'mime'

function loadFilesIntoCubeTexture(path: string, cubeTex: CubeTexture, onTexChanged: () => void) {
    type Sides = 'bk' | 'dn' | 'ft' | 'lf' | 'rt' | 'up'

    const files = new Map<Sides, File>()
    const sides: Sides[] = ['bk', 'dn', 'ft', 'lf', 'rt', 'up']
    for (let side of sides) {
        let f: File[]
        f = FakeFileSystem.FindFiles(`${path}_${side}.`, null, false)
        if (f?.length === 0) {
            console.warn(`Couldn't find skybox texture`, path)
            return null
        }
        files.set(side, f[0])
    }

    Promise.all(files.values().map(x => x.download()))
        .then(x => {
            if (x.some(x => !x)) {
                return
            }

            const blobUrls = new Map<Sides, string>()
            for (let [side, file] of files.entries()) {
                const blob = new Blob([file.bytes], {type: mime.getType(file.nameWithExtension)})
                blobUrls.set(side, URL.createObjectURL(blob))
            }
            const cleanup = (e?: unknown) => {
                for (let url of blobUrls.values()) {
                    URL.revokeObjectURL(url)
                }
            }
            cubeTex.updateURL(
                '', // url
                null, // forced extension
                () => {
                    cleanup()
                    onTexChanged()
                }, // onload
                null, // prefiltered
                (e) => {
                    console.error('Failed to load sky texture:', e)
                    cleanup()
                }, // onerror
                null, // extensions
                null, // delayload
                [
                    blobUrls.get('rt'),
                    blobUrls.get('up'),
                    blobUrls.get('ft'),
                    blobUrls.get('lf'),
                    blobUrls.get('dn'),
                    blobUrls.get('bk'),
                ],
                null, // buffer
            )
        })
}

export function loadSkyTextureAtPath(path: string, scene: Scene, onTexChanged: () => void): CubeTexture {
    const cubeTex = new CubeTexture(null, scene)
    cubeTex.name = path
    cubeTex.coordinatesMode = Texture.SKYBOX_MODE

    const scriptFiles = FakeFileSystem.FindFiles('scripts/', /\.shader$/i, false)
    FakeFileSystem.DownloadFiles(scriptFiles)
        .then(() => {
            for (let scriptFile of scriptFiles) {
                if (!scriptFile.text) {
                    continue
                }
                const lines = scriptFile.text.split('\n')
                let shaderMatch = false
                for (let line of lines) {
                    line = line.trim()
                    if (line === path) {
                        shaderMatch = true
                        continue
                    }
                    if (shaderMatch) {
                        if (line.startsWith('skyParms')) {
                            const split = line.split(' ')
                            const textureFile = split[1]
                            loadFilesIntoCubeTexture(textureFile, cubeTex, onTexChanged)
                            return
                        }
                        if (line.includes('}')) {
                            return
                        }
                    }
                }
            }
        })


    return cubeTex
}