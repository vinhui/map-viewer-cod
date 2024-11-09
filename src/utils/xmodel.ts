import {Color3, Material, Mesh, Scene, StandardMaterial, TransformNode, VertexData} from '@babylonjs/core'
import {XModelLoader} from '../LibXModel-js/XModel'
import {GameVersion} from '../LibXModel-js/GameVersion'
import {XModelPartLoader} from '../LibXModel-js/XModelPart'
import {XModelSurf, XModelSurfLoader} from '../LibXModel-js/XModelSurf'
import {FakeFileSystem, File} from 'libbsp-js'
import {loadTextureAtPath} from '../LibBSP-bjs/Util/texture'

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

export async function bjsLoadXModel(file: File, scene: Scene) {
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

    const surfs: {
        xmodelSurf: XModelSurf,
        materials: Material[]
    }[] = []
    for (let lod of xModel.lods) {
        const lodBytes = await getFileBytes(`xmodelsurfs/${lod.name}`)
        if (!lodBytes) {
            console.error(`Failed to find xmodelsurfs file xmodelsurfs/${lod.name}`)
            continue
        }
        const surfLoader = new XModelSurfLoader(lodBytes)
        const surf = await surfLoader.load(lod.name, xModelPart)

        const materials: Material[] = []
        for (let texturePath of lod.materials) {
            if (!modelMaterialMap.has(texturePath)) {
                const mat = new StandardMaterial(texturePath, scene)
                mat.specularColor = Color3.Black()

                const tex = loadTextureAtPath(`skins/${texturePath}`, scene, () => {
                    if (tex.hasAlpha) {
                        mat.useAlphaFromDiffuseTexture = true
                        mat.needDepthPrePass = true
                    }
                })

                mat.diffuseTexture = tex
                modelMaterialMap.set(texturePath, mat)
            }
            materials.push(modelMaterialMap.get(texturePath))
        }

        surfs.push({
            xmodelSurf: surf,
            materials: materials,
        })
    }

    const root = new TransformNode(xModel.name, scene)
    for (let surf of surfs) {
        const surfNode = new TransformNode(surf.xmodelSurf.name, scene)
        surfNode.parent = root

        for (let i = 0; i < surf.xmodelSurf.surfaces.length; i++) {
            let surface = surf.xmodelSurf.surfaces[i]
            const vertexData = new VertexData()
            vertexData.positions = surface.vertices.flatMap(x => x.position)
            vertexData.normals = surface.vertices.flatMap(x => x.normal)
            vertexData.uvs = surface.vertices.flatMap(x => x.uv)
            vertexData.colors = surface.vertices.flatMap(x => x.color)
            vertexData.indices = surface.triangles

            const mesh = new Mesh(i.toString(10), scene, surfNode)
            vertexData.applyToMesh(mesh)
            mesh.material = surf.materials[i]
        }
    }
    // root.scaling.setAll(.1 / 2.54)
    // root.rotation.x = -Math.PI / 2
    return root
}