import {CubeTexture, MeshBuilder, Scene, StandardMaterial, Texture, TransformNode} from '@babylonjs/core'
import {FakeFileSystem, File} from 'libbsp-js'
import mime from 'mime'
import {loadTextureAtPath} from './texture'

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

function getEnvTextureFromShaderName(texturePath: string, callback: (file: string) => void) {
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
                    if (line === texturePath) {
                        shaderMatch = true
                        continue
                    }
                    if (shaderMatch) {
                        if (line.startsWith('skyParms')) {
                            const split = line.split(' ')
                            const textureFile = split[1]
                            callback(textureFile)
                            return
                        }
                        if (line.includes('}')) {
                            return
                        }
                    }
                }
            }
            console.warn(`Failed to find skybox texture for shader ${texturePath}`)
        })
}

export function buildSkybox(texturePath: string, scene: Scene) {
    const size = 800
    const root = new TransformNode('Skybox ' + texturePath)
    root.infiniteDistance = true
    const left = MeshBuilder.CreatePlane('left', {size: size}, scene)
    left.parent = root
    left.position.x -= size / 2
    left.rotation.y = -Math.PI / 2
    const matLeft = new StandardMaterial('left_' + texturePath, scene)
    matLeft.disableLighting = true
    left.material = matLeft

    const right = MeshBuilder.CreatePlane('right', {size: size}, scene)
    right.parent = root
    right.position.x += size / 2
    right.rotation.y = Math.PI / 2
    const matRight = matLeft.clone('right_' + texturePath)
    right.material = matRight

    const front = MeshBuilder.CreatePlane('front', {size: size}, scene)
    front.parent = root
    front.position.z += size / 2
    const matFront = matLeft.clone('front_' + texturePath)
    front.material = matFront

    const back = MeshBuilder.CreatePlane('back', {size: size}, scene)
    back.parent = root
    back.position.z -= size / 2
    back.rotation.y = Math.PI
    const matBack = matLeft.clone('back_' + texturePath)
    back.material = matBack

    const top = MeshBuilder.CreatePlane('top', {size: size}, scene)
    top.parent = root
    top.position.y += size / 2
    top.rotation.x = -Math.PI / 2
    top.rotation.y = Math.PI / 2
    const matTop = matLeft.clone('top_' + texturePath)
    top.material = matTop

    const bottom = MeshBuilder.CreatePlane('bottom', {size: size}, scene)
    bottom.parent = root
    bottom.position.y -= size / 2
    bottom.rotation.x = Math.PI / 2
    const matBottom = matLeft.clone('bottom_' + texturePath)
    bottom.material = matBottom

    type Sides = 'bk' | 'dn' | 'ft' | 'lf' | 'rt' | 'up'
    const sidesMap = new Map<Sides, StandardMaterial>()
    sidesMap.set('ft', matBack)
    sidesMap.set('bk', matFront)
    sidesMap.set('lf', matLeft)
    sidesMap.set('rt', matRight)
    sidesMap.set('dn', matBottom)
    sidesMap.set('up', matTop)

    getEnvTextureFromShaderName(texturePath, (path) => {
        const sides: Sides[] = ['bk', 'dn', 'ft', 'lf', 'rt', 'up']
        for (let side of sides) {
            const tex = loadTextureAtPath(`${path}_${side}`, scene, () => {
            })
            tex.wrapU = Texture.CLAMP_ADDRESSMODE
            tex.wrapV = Texture.CLAMP_ADDRESSMODE
            if (!tex) {
                console.warn(`Failed to load sky texture ${path}_${side}`)
            }
            sidesMap.get(side).emissiveTexture = tex
        }

    })
}