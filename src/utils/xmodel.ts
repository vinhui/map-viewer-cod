import {Color3, Material, Matrix, Mesh, Scene, StandardMaterial, VertexData} from '@babylonjs/core'
import {XModelLoader} from '../LibXModel-js/XModel'
import {GameVersion} from '../LibXModel-js/GameVersion'
import {XModelPartLoader} from '../LibXModel-js/XModelPart'
import {XModelSurfLoader} from '../LibXModel-js/XModelSurf'
import {FakeFileSystem, File} from 'libbsp-js'
import {loadTextureAtPath} from '../LibBSP-bjs/Util/texture'
import {MeshUtils} from '../LibBSP-bjs/Util/MeshUtils'

async function getFileBytes(path: string) {
    const files = FakeFileSystem.FindFiles(path, null, false)
    if (files.length === 0) {
        return null
    }
    const file = files[0]
    if (!await file.download()) {
        return null
    }
    return file.bytes
}

const modelMaterialMap = new Map<string, Material>()
const correctionMatrix = Matrix.Scaling(-MeshUtils.inch2MeterScale, MeshUtils.inch2MeterScale, MeshUtils.inch2MeterScale)

export async function bjsLoadXModel(file: File, scene: Scene): Promise<{ root: Mesh, collisionMesh: Mesh | null }> {
    if (!file.isLoaded) {
        if (!await file.download()) {
            return null
        }
    }
    const xModelBytes = file.bytes
    const xModelLoader = new XModelLoader(xModelBytes)
    const xModel = await xModelLoader.load(file.originalPath, GameVersion.CoD)

    const firstLod = xModel.lods[0]
    const xModelPartBytes = await getFileBytes(`xmodelparts/${firstLod.name}`)
    if (!xModelPartBytes) {
        console.error(`Failed to find xmodelparts file xmodelparts/${firstLod.name}`)
        return
    }
    const xModelPartLoader = new XModelPartLoader(xModelPartBytes)
    const xModelPart = await xModelPartLoader.load(firstLod.name)

    const root = new Mesh(xModel.name, scene)
    const lodMeshes: { distance: number, mesh: Mesh }[] = []
    let collisionMesh: Mesh

    for (let i = 0; i < xModel.lods.length; i++) {
        let lod = xModel.lods[i]
        const lodBytes = await getFileBytes(`xmodelsurfs/${lod.name}`)
        if (!lodBytes) {
            console.error(`Failed to find xmodelsurfs file xmodelsurfs/${lod.name}`)
            continue
        }
        const surfLoader = new XModelSurfLoader(lodBytes)
        try {
            const surf = await surfLoader.load(lod.name, xModelPart)

            const materials: Material[] = []
            for (let texturePath of lod.materials) {
                if (!modelMaterialMap.has(texturePath)) {
                    const mat = new StandardMaterial(texturePath, scene)
                    mat.specularColor = Color3.Black()
                    mat.customShaderNameResolve = (shaderName, uniforms, uniformBuffers, samplers, defines, attributes, options) => {
                        if (texturePath.startsWith('foliage_')) {
                            if (Array.isArray(defines)) {
                                defines.push('INVERT_OPACITY_TEX')
                            } else {
                                defines['INVERT_OPACITY_TEX'] = true
                                defines.rebuild()
                            }
                        }
                        return shaderName
                    }

                    loadTextureAtPath(`skins/${texturePath}`, scene)
                        .then(tex => {
                            if (!tex) {
                                console.error(`Failed to load xmodel texture "${texturePath}"`)
                                return
                            }
                            if (tex.hasAlpha) {
                                mat.useAlphaFromDiffuseTexture = true
                                mat.needDepthPrePass = true
                            }
                            if (texturePath.startsWith('foliage_')) {
                                mat.opacityTexture = tex
                                mat.transparencyMode = 1
                            }
                            mat.diffuseTexture = tex
                        })

                    modelMaterialMap.set(texturePath, mat)
                }
                materials.push(modelMaterialMap.get(texturePath))
            }

            const lodMesh = new Mesh(lod.name, scene, root)
            let collisionVertexData: VertexData
            if (i === xModel.collisionLodIndex) {
                collisionMesh = new Mesh('collision_' + lod.name, scene, root)
                collisionMesh.setEnabled(false)
                collisionMesh.isPickable = false
                collisionMesh.isVisible = false
            }
            for (let n = 0; n < surf.surfaces.length; n++) {
                let surface = surf.surfaces[n]

                const vertexData = new VertexData()
                vertexData.positions = surface.vertices.flatMap(x => x.position)
                vertexData.normals = surface.vertices.flatMap(x => x.normal)
                vertexData.uvs = surface.vertices.flatMap(x => x.uv)
                vertexData.colors = surface.vertices.flatMap(x => x.color)
                vertexData.indices = surface.triangles
                vertexData.transform(correctionMatrix)

                const mesh = new Mesh(`${n}_${materials[n]?.name}`, scene, lodMesh)
                vertexData.applyToMesh(mesh)
                mesh.material = materials[n]

                if (i === xModel.collisionLodIndex) {
                    if (!collisionVertexData) {
                        collisionVertexData = vertexData
                    } else {
                        collisionVertexData.merge(vertexData)
                    }
                }
            }
            if (i === xModel.collisionLodIndex) {
                collisionVertexData.applyToMesh(collisionMesh)
            }

            root.addLODLevel(lod.distance * MeshUtils.inch2MeterScale, lodMesh)
            lodMeshes.push({distance: lod.distance * MeshUtils.inch2MeterScale, mesh: lodMesh})
        } catch (e) {
            console.error('Failed to load xmodel ' + xModel.name, e)
            return {
                root: root,
                collisionMesh: null,
            }
        }
    }

    root.onLODLevelSelection = (distance) => {
        let match = false
        for (let level of lodMeshes) {
            if (!match && (distance <= level.distance || level.distance === 0)) {
                match = true
                level.mesh.setEnabled(true)
            } else {
                level.mesh.setEnabled(false)
            }
        }
    }

    root.rotation.x = -Math.PI / 2
    root.rotation.y += Math.PI / 2

    return {
        root: root,
        collisionMesh: collisionMesh,
    }
}