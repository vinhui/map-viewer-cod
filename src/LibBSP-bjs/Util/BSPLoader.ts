import {Entity} from '../../LibBSP/Structs/Common/Entity'
import {
    ISize,
    Material,
    Mesh,
    RawTexture,
    Scene,
    StandardMaterial,
    Texture as BjsTex,
    TransformNode,
    Vector3 as BjsVec3,
    VertexData,
} from '@babylonjs/core'
import {BSP} from '../../LibBSP/Structs/BSP/BSP'
import {LibBSP} from '../../LibBSP/LibBSP'
import {FakeFileSystem} from '../../LibBSP/FakeFileSystem'
import {Face} from '../../LibBSP/Structs/BSP/Face'
import {Texture as BspTex} from '../../LibBSP/Structs/BSP/Texture'
import {LODTerrain} from '../../LibBSP/Structs/BSP/LODTerrain'
import {BSPExtension} from '../Extensions/BSPExtension'
import {MeshUtils} from './MeshUtils'

export enum MeshCombineOptions {
    None,
    PerMaterial,
}

type Settings = {
    baseUrl: string
    path: string
    scene?: Scene
    meshCombineOptions: MeshCombineOptions
    curveTesselationLevel: number
    entityCreatedCallback?: (entity: EntityInstance, targets: EntityInstance[]) => void
    scaleFactor: number
}

type EntityInstance = {
    entity: Entity
    bjsNode: Mesh
}

export class BSPLoader {
    public settings: Settings
    private bsp: BSP
    private root: TransformNode
    private entityInstances: EntityInstance[] = []
    private namedEntities: Map<string, EntityInstance[]> = new Map()
    private materialDirectory: Map<string, StandardMaterial> = new Map()

    public async loadBSP(bsp: BSP) {
        this.settings.baseUrl = this.settings.baseUrl ?? './'
        if (!bsp) {
            if (!this.settings?.path) {
                throw new Error(`Cannot import ${this.settings.path}: The path is invalid`)
                return
            }
            this.bsp = await LibBSP.LoadBSP(this.settings.baseUrl, this.settings.path)
            await this.loadBSP(this.bsp)
        } else {
            this.bsp = bsp
            for (let i = 0; i < bsp.entities.count; i++) {
                const entity = bsp.entities.get(i)
                const instance: EntityInstance = this.createEntityInstance(entity)
                this.entityInstances.push(instance)
                this.namedEntities.get(entity.name).push(instance)

                const modelNumber = entity.modelNumber
                if (modelNumber >= 0) {
                    this.buildMesh(instance)
                } else {
                    const angles = entity.angles
                    instance.bjsNode.rotation = new BjsVec3(angles.x, angles.y, angles.z)
                }
                instance.bjsNode.position = new BjsVec3(entity.origin.x, entity.origin.y, entity.origin.z).scaleInPlace(this.settings.scaleFactor)
            }

            this.root = new TransformNode(bsp.mapName)
            for (let value of this.namedEntities.values()) {
                this.SetUpEntityHierarchy(value)
            }

            if (this.settings.entityCreatedCallback) {
                for (let instance of this.entityInstances) {
                    const target = instance.entity.get('target')
                    if (this.namedEntities.has(target) && target) {
                        this.settings.entityCreatedCallback(instance, this.namedEntities.get(target))
                    } else {
                        this.settings.entityCreatedCallback(instance, [])
                    }
                }
            }
        }
    }

    protected createFaceMesh(face: Face, textureName: string): VertexData {
        let dims: ISize
        if (!this.materialDirectory.has(textureName)) {
            this.loadMaterial(textureName)
        }
        const bjsTex = this.materialDirectory.get(textureName).diffuseTexture
        if (bjsTex) {
            // TODO: Not sure if loading textures from uint8array will still load async
            // If they load async, this probably won't work
            dims = bjsTex.getSize()
        } else {
            dims = {
                width: 128,
                height: 128,
            }
        }

        let mesh: VertexData
        if (face.displacementIndex >= 0) {
            mesh = MeshUtils.CreateDisplacementMesh(this.bsp, face, dims)
        } else {
            mesh = MeshUtils.CreateFaceMesh(this.bsp, face, dims, this.settings.curveTesselationLevel)
        }

        return mesh
    }

    protected createLoDTerrainMesh(lodTerrain: LODTerrain, textureName: string): VertexData {
        if (!this.materialDirectory.has(textureName)) {
            this.loadMaterial(textureName)
        }
        return MeshUtils.CreateMoHAATerrainMesh(this.bsp, lodTerrain)
    }

    private loadTextureAtPath(path: string) {
        if (FakeFileSystem.FileExists(path)) {
            const fileBytes = FakeFileSystem.ReadFile(path)
            if (path.endsWith('.ftx')) {
                if (fileBytes.byteLength < 12) {
                    console.warn(`Invalid FTX texture file at path "${path}": File too small`)
                    return null
                }
                const view = new DataView(fileBytes.buffer)
                const width = view.getInt32(0)
                const height = view.getInt32(4)

                if (fileBytes.byteLength < (width * height * 4) + 12) {
                    console.warn(`Invalid FTX texture file at path "${path}": Not enough pixels`)
                    return null
                }

                return RawTexture.CreateRGBATexture(fileBytes.slice(12), width, height, this.settings.scene, true, true)
            } else {
                return new BjsTex(
                    null, // url
                    this.settings.scene, // scene
                    null, // no mipmap or options
                    null, // inverty
                    null, // samplingmode
                    null, // onload
                    null, // onerror
                    fileBytes.buffer, // buffer
                    false, // delete buffer
                    null, // format
                    null, // mimetype
                    null, // loaderoptions
                    null, // creationflags
                    path.split('.').pop(), // forced extension
                )
            }
        } else {
            let baseUrl = this.settings.baseUrl
            if (!baseUrl.endsWith('/')) {
                baseUrl = baseUrl + '/'
            }
            if (path.startsWith('/')) {
                path = path.substring(1)
            }
            return new BjsTex(baseUrl + path, this.settings.scene)
        }
    }

    private loadMaterial(textureName: string) {
        const tex = this.loadTextureAtPath(textureName)
        if (!tex) {
            console.warn(`Texture ${textureName} could not be loaded (does the file exist?)`)
        }

        const material = new StandardMaterial(textureName)
        if (tex) {
            material.diffuseTexture = tex
            material.roughness = 1
            material.specularPower = 0
        }

        this.materialDirectory.set(textureName, material)
    }

    private createEntityInstance(entity: Entity): EntityInstance {
        if (!this.namedEntities.has(entity.name) || !this.namedEntities.get(entity.name)) {
            this.namedEntities.set(entity.name, [])
        }

        return {
            entity: entity,
            bjsNode: new Mesh(`${entity.className}${entity.name ? ` ${entity.name}` : ''}`, this.settings.scene),
        }
    }

    private SetUpEntityHierarchy(instance: EntityInstance[] | EntityInstance) {
        if (Array.isArray(instance)) {
            for (let i of instance) {
                this.SetUpEntityHierarchy(i)
            }
        } else {
            if (!instance.entity.has('parentname')) {
                instance.bjsNode.setParent(this.root, true)
                return
            }

            const parentName = instance.entity.get('parentname')
            if (this.namedEntities.has(parentName)) {
                const e = this.namedEntities.get(parentName)
                if (e.length > 0) {
                    console.warn(`Entity "${instance.bjsNode.name}" claims to have parent "${instance.entity.get('parentname')}" but more than one matching entity exists.`, instance.bjsNode)
                }

                instance.bjsNode.setParent(e[0].bjsNode, true)
            } else {
                console.warn(`Entity "${instance.bjsNode.name}" claims to have parent "${parentName}" but no such entity exists.`, instance.bjsNode)
            }
        }
    }

    private buildMesh(instance: EntityInstance) {
        const modelNumber = instance.entity.modelNumber
        const model = this.bsp.models.get(modelNumber)
        const textureMeshMap: Map<string, VertexData[]> = new Map()
        const bjsNode = instance.bjsNode

        const faces: Face[] = BSPExtension.GetFacesInModel(this.bsp, model)
        let i = 0
        for (i = 0; i < faces.length; i++) {
            const face = faces[i]
            if (face.numEdgeIndices <= 0 && face.numVertices <= 0) {
                continue
            }

            const textureIndex = BSPExtension.GetTextureIndex(this.bsp, face)
            let textureName = ''
            if (textureIndex >= 0) {
                const texture = this.bsp.textures.get(textureIndex)
                textureName = BspTex.SanitizeName(texture.name, this.bsp.mapType)
                if (!textureName.startsWith('tools/')) {
                    if (!textureMeshMap.has(textureName) || !textureMeshMap.get(textureName)) {
                        textureMeshMap.set(textureName, [])
                    }

                    textureMeshMap.get(textureName).push(this.createFaceMesh(face, textureName))
                }
            }
        }

        if (modelNumber === 0) {
            if (this.bsp.lodTerrains) {
                for (const lodTerrain of this.bsp.lodTerrains) {
                    if (lodTerrain.textureIndex >= 0) {
                        const texture = this.bsp.textures.get(lodTerrain.textureIndex)
                        const textureName = texture.name

                        if (!textureMeshMap.has(textureName) || !textureMeshMap.get(textureName)) {
                            textureMeshMap.set(textureName, [])
                        }

                        textureMeshMap.get(textureName).push(this.createLoDTerrainMesh(lodTerrain, textureName))
                    }
                }
            }
        }

        if (this.settings.meshCombineOptions === MeshCombineOptions.PerMaterial) {
            const textureMeshes: VertexData[] = []
            const materials: Material[] = []
            i = 0

            for (let [key, value] of textureMeshMap.entries()) {
                textureMeshes[i] = MeshUtils.CombineAllMeshes(value)
                if (textureMeshes[i].positions.length > 0) {
                    if (this.materialDirectory.has(key)) {
                        materials[i] = this.materialDirectory[key]
                    }
                    if (this.settings.meshCombineOptions === MeshCombineOptions.PerMaterial) {
                        const textureNode = new Mesh(key, this.settings.scene)
                        textureNode.setParent(bjsNode, true)
                        textureNode.position.setAll(0)
                        for (let j = 0; j < textureMeshes[i].positions.length; j++) {
                            textureMeshes[i].positions[j] *= this.settings.scaleFactor
                        }
                        if (textureMeshes[i].normals.length < 3
                            || (!textureMeshes[i].normals[0] || !textureMeshes[i].normals[1] || !textureMeshes[i].normals[2])) {
                            VertexData.ComputeNormals(textureMeshes[i].positions, textureMeshes[i].indices, textureMeshes[i].normals)
                        }

                        textureMeshes[i].applyToMesh(textureNode, false)
                        textureNode.material = materials[i]
                    }
                    ++i
                }
            }
        } else {
            i = 0
            for (let [key, value] of textureMeshMap.entries()) {
                const textureNode = new Mesh(key, this.settings.scene)
                textureNode.setParent(bjsNode, true)
                textureNode.position.setAll(0)
                const material = this.materialDirectory.get(key)
                for (let mesh of value) {
                    if (mesh.positions.length > 3) {
                        const faceNode = new Mesh('Face')
                        faceNode.setParent(textureNode, true)
                        faceNode.position.setAll(0)
                        for (let j = 0; j < mesh.positions.length; j++) {
                            mesh.positions[j] *= this.settings.scaleFactor
                        }

                        if (mesh.normals.length < 3
                            || (!mesh.normals[0] || !mesh.normals[1] || !mesh.normals[2])) {
                            VertexData.ComputeNormals(mesh.positions, mesh.indices, mesh.normals)
                        }

                        mesh.applyToMesh(faceNode, false)
                        faceNode.material = material
                    }
                }
                ++i
            }
        }
    }
}