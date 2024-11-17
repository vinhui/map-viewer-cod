import {MeshBuilder, Scene, StandardMaterial, Texture, TransformNode} from '@babylonjs/core'
import {FakeFileSystem} from 'libbsp-js'
import {loadTextureAtPath} from './texture'

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
    left.position.x += size / 2
    left.rotation.y = Math.PI / 2
    left.rotation.z = Math.PI
    const matLeft = new StandardMaterial('left_' + texturePath, scene)
    matLeft.disableLighting = true
    left.material = matLeft

    const right = MeshBuilder.CreatePlane('right', {size: size}, scene)
    right.parent = root
    right.position.x -= size / 2
    right.rotation.y = -Math.PI / 2
    right.rotation.z = Math.PI
    const matRight = matLeft.clone('right_' + texturePath)
    right.material = matRight

    const front = MeshBuilder.CreatePlane('front', {size: size}, scene)
    front.parent = root
    front.position.z += size / 2
    front.rotation.z = Math.PI
    const matFront = matLeft.clone('front_' + texturePath)
    front.material = matFront

    const back = MeshBuilder.CreatePlane('back', {size: size}, scene)
    back.parent = root
    back.position.z -= size / 2
    back.rotation.y = Math.PI
    back.rotation.z = Math.PI
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
            loadTextureAtPath(`${path}_${side}`, scene)
                .then(tex => {
                    tex.wrapU = Texture.CLAMP_ADDRESSMODE
                    tex.wrapV = Texture.CLAMP_ADDRESSMODE
                    if (!tex) {
                        console.warn(`Failed to load sky texture ${path}_${side}`)
                    }
                    sidesMap.get(side).emissiveTexture = tex
                })
        }
    })
}