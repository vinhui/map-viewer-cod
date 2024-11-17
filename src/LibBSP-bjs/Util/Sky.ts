import {MeshBuilder, Scene, StandardMaterial, Texture, TransformNode} from '@babylonjs/core'
import {findTextureFromShader, loadTextureAtPath} from './texture'
import {AssetLoadingState} from '../../utils/AssetLoadingState'

async function getEnvTextureFromShaderName(texturePath: string) {
    return findTextureFromShader(texturePath, 'skyParms')
}

export function buildSkybox(texturePath: string, scene: Scene) {
    AssetLoadingState.onStartLoading(texturePath)
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

    getEnvTextureFromShaderName(texturePath).then((path) => {
        const sides: Sides[] = ['bk', 'dn', 'ft', 'lf', 'rt', 'up']
        for (let side of sides) {
            loadTextureAtPath(`${path}_${side}`, scene)
                .then(tex => {
                    AssetLoadingState.onLoadingComplete(texturePath)
                    if (!tex) {
                        console.warn(`Failed to load sky texture ${path}_${side}`)
                        return
                    }
                    tex.wrapU = Texture.CLAMP_ADDRESSMODE
                    tex.wrapV = Texture.CLAMP_ADDRESSMODE
                    sidesMap.get(side).emissiveTexture = tex
                })
        }
    })
}