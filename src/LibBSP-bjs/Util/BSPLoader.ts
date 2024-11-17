import {BSP, Entity, Face, FakeFileSystem, LODTerrain, MapType, Texture as BspTex} from 'libbsp-js'
import {
    Color3,
    Engine,
    ISize,
    Material,
    Mesh,
    RawTexture,
    Scene,
    StandardMaterial,
    Tools,
    TransformNode,
    Vector3 as BjsVec3,
    VertexData,
} from '@babylonjs/core'
import {BSPExtension} from '../Extensions/BSPExtension'
import {MeshUtils} from './MeshUtils'
import {loadTextureAtPath} from './texture'
import {buildSkybox} from './Sky'

export enum MeshCombineOptions {
    None,
    PerMaterial,
}

type Settings = {
    path?: string
    scene?: Scene
    meshCombineOptions: MeshCombineOptions
    curveTesselationLevel: number
    entityCreatedCallback?: (entity: EntityInstance, targets: EntityInstance[]) => void
    scaleFactor: number
}

export type EntityInstance = {
    entity: Entity
    bjsNode: Mesh
}

export class BSPLoader {
    public settings: Settings
    private entityInstances: EntityInstance[] = []
    private namedEntities: Map<string, EntityInstance[]> = new Map()
    private materialDirectory: Map<string, Map<number, Material>> = new Map()
    private lightmapTextures: RawTexture[] = []

    private _root: TransformNode

    public get root(): TransformNode {
        return this._root
    }

    private _bsp: BSP

    public get bsp(): BSP {
        return this._bsp
    }

    public async loadBSP(bsp?: BSP): Promise<TransformNode> {
        if (!bsp) {
            if (!this.settings?.path) {
                throw new Error(`Cannot import ${this.settings.path}: The path is invalid`)
            }

            const bspFile = await FakeFileSystem.DownloadFile(this.settings.path)
            if (!bspFile) {
                throw new Error(`Failed to download bsp file: ${this.settings.path}`)
            }

            const lumpFiles = FakeFileSystem.FindFiles(this.settings.path.substring(0, this.settings.path.lastIndexOf('.')), /\.lmp$/, false)
            await FakeFileSystem.DownloadFiles(lumpFiles)
            this._bsp = new BSP(bspFile)
            await this.loadBSP(this._bsp)
        } else {
            this._bsp = bsp
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
                    instance.bjsNode.rotation = new BjsVec3(Tools.ToRadians(angles.x), Tools.ToRadians(angles.z), Tools.ToRadians(angles.y))
                }
                const origin = entity.origin
                instance.bjsNode.position = new BjsVec3(origin.x, origin.y, origin.z).scaleInPlace(this.settings.scaleFactor)
            }

            this._root = new TransformNode(bsp.mapName)
            this._root.rotation.x = -Math.PI / 2
            this._root.scaling.setAll(MeshUtils.inch2MeterScale)
            this._root.scaling.x *= -1
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

        return this._root
    }

    protected createFaceMesh(face: Face, textureName: string): VertexData {
        const s = textureName.toLowerCase()
        if (s.includes('textures/sky/') || s.startsWith('textures/skies/')) {
            buildSkybox(s, this.settings.scene)
            return
        }

        let dims: ISize
        if (!this.materialDirectory.has(textureName) || !this.materialDirectory.get(textureName).has(face.lightmap)) {
            this.loadMaterial(textureName, face.lightmap)
        }
        const material = this.materialDirectory.get(textureName).get(face.lightmap)
        const textures = material.getActiveTextures()
        const bjsTex = textures[0]

        if (bjsTex) {
            dims = bjsTex.getSize()
        } else {
            dims = {
                width: 128,
                height: 128,
            }
        }

        let mesh: VertexData
        if (face.displacementIndex >= 0) {
            mesh = MeshUtils.CreateDisplacementMesh(this._bsp, face, dims)
        } else {
            mesh = MeshUtils.CreateFaceMesh(this._bsp, face, dims, this.settings.curveTesselationLevel)
        }

        return mesh
    }

    protected createLoDTerrainMesh(lodTerrain: LODTerrain, textureName: string): VertexData {
        if (!this.materialDirectory.has(textureName)) {
            this.loadMaterial(textureName, lodTerrain.lightmap)
        }
        return MeshUtils.CreateMoHAATerrainMesh(this._bsp, lodTerrain)
    }

    private loadMaterial(textureName: string, lightmapIndex: number) {
        const material = new StandardMaterial(lightmapIndex + textureName, this.settings.scene)
        material.specularColor = Color3.Black()
        material.lightmapTexture = this.getLightmapTexture(lightmapIndex)
        material.useLightmapAsShadowmap = true
        if (textureName.toLowerCase().includes('decal@')) {
            material.zOffset = -1
        }
        loadTextureAtPath(textureName, this.settings.scene)
            .then(tex => {
                if (!tex) {
                    console.warn(`Texture ${textureName} could not be loaded (does the file exist?)`)
                    return
                }
                material.diffuseTexture = tex

                if (tex.hasAlpha) {
                    // material.useAlphaFromDiffuseTexture = true
                    material.needDepthPrePass = true
                    material.opacityTexture = tex
                }
            })

        if (!this.materialDirectory.get(textureName)) {
            this.materialDirectory.set(textureName, new Map<number, StandardMaterial>())
        }
        this.materialDirectory.get(textureName).set(lightmapIndex, material)
    }

    private getLightmapTexture(index: number): RawTexture {
        if (index < 0) {
            return null
        }

        if (!this.lightmapTextures[index]) {
            let dim: number = 0
            if (this.bsp.mapType === MapType.CoD || this.bsp.mapType === MapType.CoDDemo) {
                dim = 512
            } else if (this.bsp.mapType === MapType.Quake3) {
                dim = 128
            } else {
                console.warn(`Lightmap for mapType ${this.bsp.mapType} currently not supported`)
                return null
            }

            const byteSize = dim * dim * 3
            const byteOffset = byteSize * index
            const bytes = this._bsp.lightmaps.data.slice(byteOffset, byteOffset + byteSize)
            if (bytes.length === 0) {
                return
            }
            const tex = new RawTexture(bytes, 512, 512, Engine.TEXTUREFORMAT_RGB, this.settings.scene, false, false)
            tex.name = `Lightmap${index}`
            tex.coordinatesIndex = 1
            this.lightmapTextures[index] = tex
        }
        return this.lightmapTextures[index]
    }

    private createEntityInstance(entity: Entity): EntityInstance {
        if (!this.namedEntities.has(entity.name) || !this.namedEntities.get(entity.name)) {
            this.namedEntities.set(entity.name, [])
        }

        const mesh = new Mesh(`${entity.className}${entity.name ? ` ${entity.name}` : ''}`, this.settings.scene)
        if (!mesh.metadata)
            mesh.metadata = {}
        for (let [k, v] of entity.map.entries()) {
            mesh.metadata[k] = v
        }
        return {
            entity: entity,
            bjsNode: mesh,
        }
    }

    private SetUpEntityHierarchy(instance: EntityInstance[] | EntityInstance) {
        if (Array.isArray(instance)) {
            for (let i of instance) {
                this.SetUpEntityHierarchy(i)
            }
        } else {
            if (!instance.entity.has('parentname')) {
                instance.bjsNode.parent = this._root
                return
            }

            const parentName = instance.entity.get('parentname')
            if (this.namedEntities.has(parentName)) {
                const e = this.namedEntities.get(parentName)
                if (e.length > 0) {
                    console.warn(`Entity "${instance.bjsNode.name}" claims to have parent "${instance.entity.get('parentname')}" but more than one matching entity exists.`, instance.bjsNode)
                }

                instance.bjsNode.parent = e[0].bjsNode
            } else {
                console.warn(`Entity "${instance.bjsNode.name}" claims to have parent "${parentName}" but no such entity exists.`, instance.bjsNode)
            }
        }
    }

    private buildMesh(instance: EntityInstance) {
        const modelNumber = instance.entity.modelNumber
        const model = this._bsp.models.get(modelNumber)
        const textureMeshMap: Map<string, Map<number, VertexData[]>> = new Map()
        const bjsNode = instance.bjsNode

        const faces: Face[] = BSPExtension.GetFacesInModel(this._bsp, model)
        let i: number
        for (i = 0; i < faces.length; i++) {
            const face = faces[i]
            if (face.numEdgeIndices <= 0 && face.numVertices <= 0) {
                continue
            }

            const textureIndex = BSPExtension.GetTextureIndex(this._bsp, face)
            let textureName = ''
            if (textureIndex >= 0) {
                const texture = this._bsp.textures.get(textureIndex)
                textureName = BspTex.SanitizeName(texture.name, this._bsp.mapType)
                if (!textureName.toLowerCase().startsWith('textures/tools/')) {
                    if (!textureMeshMap.has(textureName) || !textureMeshMap.get(textureName)) {
                        const map = new Map<number, VertexData[]>()
                        textureMeshMap.set(textureName, map)
                    }
                    if (!textureMeshMap.get(textureName).has(face.lightmap)) {
                        textureMeshMap.get(textureName).set(face.lightmap, [])
                    }

                    const mesh = this.createFaceMesh(face, textureName)
                    if (mesh) {
                        textureMeshMap.get(textureName).get(face.lightmap).push(mesh)
                    }
                }
            }
        }

        if (modelNumber === 0) {
            if (this._bsp.lodTerrains) {
                for (const lodTerrain of this._bsp.lodTerrains) {
                    if (lodTerrain.textureIndex >= 0) {
                        const texture = this._bsp.textures.get(lodTerrain.textureIndex)
                        const textureName = texture.name

                        if (!textureMeshMap.has(textureName) || !textureMeshMap.get(textureName)) {
                            const map = new Map<number, VertexData[]>()
                            textureMeshMap.set(textureName, map)
                        }
                        if (!textureMeshMap.get(textureName).has(lodTerrain.lightmap)) {
                            textureMeshMap.get(textureName).set(lodTerrain.lightmap, [])
                        }

                        textureMeshMap.get(textureName).get(lodTerrain.lightmap).push(this.createLoDTerrainMesh(lodTerrain, textureName))
                    }
                }
            }
        }

        if (this.settings.meshCombineOptions === MeshCombineOptions.PerMaterial) {
            const textureMeshes: VertexData[] = []
            const materials: Material[] = []
            i = 0

            for (let [texName, map] of textureMeshMap.entries()) {
                for (let [lightmapIndex, vertexData] of map.entries()) {
                    textureMeshes[i] = MeshUtils.CombineAllMeshes(vertexData)
                    if (textureMeshes[i]?.positions.length > 0) {
                        if (this.materialDirectory.has(texName)) {
                            materials[i] = this.materialDirectory.get(texName).get(lightmapIndex)
                        }
                        const textureNode = new Mesh(texName, this.settings.scene)
                        textureNode.parent = bjsNode
                        for (let j = 0; j < textureMeshes[i].positions.length; j++) {
                            textureMeshes[i].positions[j] *= this.settings.scaleFactor
                        }
                        if (textureMeshes[i].normals.length < 3
                            || (!textureMeshes[i].normals[0] || !textureMeshes[i].normals[1] || !textureMeshes[i].normals[2])) {
                            VertexData.ComputeNormals(textureMeshes[i].positions, textureMeshes[i].indices, textureMeshes[i].normals)
                        }

                        textureMeshes[i].applyToMesh(textureNode, false)
                        textureNode.material = materials[i]
                        ++i
                    }
                }
            }
        } else {
            i = 0
            for (let [texName, map] of textureMeshMap.entries()) {
                for (let [lightmapIndex, vertexData] of map.entries()) {

                    const textureNode = new Mesh(texName, this.settings.scene)
                    textureNode.parent = bjsNode
                    const material = this.materialDirectory.get(texName).get(lightmapIndex)
                    for (let mesh of vertexData) {
                        if (mesh.positions.length > 3) {
                            const faceNode = new Mesh('Face')
                            faceNode.parent = textureNode
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
}