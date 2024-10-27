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
import {FakeFileSystem, File} from '../../LibBSP/FakeFileSystem'
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
    private materialDirectory: Map<string, StandardMaterial> = new Map()

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

            if (!await FakeFileSystem.DownloadFile(this.settings.path)) {
                throw new Error(`Failed to download bsp file: ${this.settings.path}`)
            }

            const lumpFiles = FakeFileSystem.FindFiles(this.settings.path.substring(0, this.settings.path.lastIndexOf('.')), /\.lmp$/, false)
            await FakeFileSystem.DownloadFiles(lumpFiles)
            this._bsp = new BSP(FakeFileSystem.GetFile(this.settings.path))
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
                    instance.bjsNode.rotation = new BjsVec3(angles.x, angles.y, angles.z)
                }
                instance.bjsNode.position = new BjsVec3(entity.origin.x, entity.origin.y, entity.origin.z).scaleInPlace(this.settings.scaleFactor)
            }

            this._root = new TransformNode(bsp.mapName)
            this._root.rotation.x = -Math.PI / 2
            this._root.scaling.x = -1
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
            mesh = MeshUtils.CreateDisplacementMesh(this._bsp, face, dims)
        } else {
            mesh = MeshUtils.CreateFaceMesh(this._bsp, face, dims, this.settings.curveTesselationLevel)
        }

        return mesh
    }

    protected createLoDTerrainMesh(lodTerrain: LODTerrain, textureName: string): VertexData {
        if (!this.materialDirectory.has(textureName)) {
            this.loadMaterial(textureName)
        }
        return MeshUtils.CreateMoHAATerrainMesh(this._bsp, lodTerrain)
    }

    private loadTextureAtPath(path: string) {
        if (FakeFileSystem.hasLoadedIndex) {
            const matches = FakeFileSystem.FindFiles(path, null, false)
            if (matches.length === 0) {
                return null
            }

            for (let match of matches) {
                if (match.directory + match.nameWithoutExtension === path) {
                    if (match.isLoaded) {
                        if (match.extension === '.ftx') {
                            return this.getFtxTexture(match)
                        } else {
                            return new BjsTex(
                                'data:' + match.originalPath, // url
                                this.settings.scene, // scene
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
                        }
                    } else {
                        if (match.extension === '.ftx') {
                            console.error(`Using FTX textures that aren't preloaded is currently not supported.\nYou need to pre-download them through the FakeFileSystem beforehand.`)
                            return null
                        }
                        let tex = new BjsTex(null, this.settings.scene)
                        tex.name = match.originalPath
                        match.download()
                            .then(x => {
                                if (x) {
                                    tex.updateURL(
                                        'data:' + match.originalPath, // url
                                        match.bytes.buffer, // buffer
                                        null, // onload
                                        null, // forced extension
                                    )
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
            const tex = new BjsTex(null, this.settings.scene)
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
                        if (responseCount === extensions.length && !foundMatch) {
                            console.error(`Failed to find texture ${path}`)
                        }
                    })
            }
            return tex
        }
    }

    private getFtxTexture(file: File) {
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

        const tex = RawTexture.CreateRGBATexture(bytes.slice(12), width, height, this.settings.scene, true, false)
        tex.name = file.originalPath
        return tex
    }

    private loadMaterial(textureName: string) {
        const tex = this.loadTextureAtPath(textureName)
        if (!tex) {
            console.warn(`Texture ${textureName} could not be loaded (does the file exist?)`)
        }

        const material = new StandardMaterial(textureName)
        material.roughness = 1
        material.specularPower = 5
        if (tex) {
            material.diffuseTexture = tex
            material.useAlphaFromDiffuseTexture = true
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
        const textureMeshMap: Map<string, VertexData[]> = new Map()
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
                if (!textureName.startsWith('tools/')) {
                    if (!textureMeshMap.has(textureName) || !textureMeshMap.get(textureName)) {
                        textureMeshMap.set(textureName, [])
                    }

                    textureMeshMap.get(textureName).push(this.createFaceMesh(face, textureName))
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
                        materials[i] = this.materialDirectory.get(key)
                    }
                    const textureNode = new Mesh(key, this.settings.scene)
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
        } else {
            i = 0
            for (let [key, value] of textureMeshMap.entries()) {
                const textureNode = new Mesh(key, this.settings.scene)
                textureNode.parent = bjsNode
                const material = this.materialDirectory.get(key)
                for (let mesh of value) {
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